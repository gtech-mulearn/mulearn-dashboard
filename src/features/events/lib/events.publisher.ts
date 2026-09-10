import type { EventDetail, EventListItem } from "../types";

type EventWithPublisher = Partial<EventListItem> &
  Partial<EventDetail> & {
    organizer?: EventListItem["organizer"];
  };

/**
 * Resolves the display / sorting publisher name for an event.
 * Per requirement: if an event has a college/campus associated with it,
 * sort using that college name.
 * Otherwise, fall back to IG name, company name, or µLearn.
 */
export function getEventPublisherName(event: EventWithPublisher): string {
  if (!event) return "µLearn";

  const organizer = event.organizer;
  if (organizer) {
    const orgCampus = organizer.campus ?? organizer.organiser_campus;
    const collegeName = orgCampus?.title ?? orgCampus?.name;

    // "if it is college name then sort using that"
    if (collegeName?.trim()) {
      return collegeName.trim();
    }

    const type = organizer.type ?? organizer.organiser_type;

    if (type === "global_ig") {
      const igName = organizer.ig?.name ?? organizer.organiser_ig?.name;
      if (igName?.trim()) return igName.trim();
    }

    if (type === "campus_ig") {
      // If college name was already found above, it returned already.
      // Fallback if campus details are missing:
      const igName =
        organizer.ig?.name ??
        organizer.organiser_ig?.name ??
        organizer.campus_ig?.name;
      if (igName?.trim()) return igName.trim();
    }

    if (type === "company") {
      const comp = organizer.company ?? organizer.organiser_company;
      const compName = comp?.title ?? comp?.name;
      if (compName?.trim()) return compName.trim();
    }

    if (type === "admin") {
      return "µLearn";
    }

    // Any other IG or organizer name present
    const fallbackIg = organizer.ig?.name ?? organizer.organiser_ig?.name;
    if (fallbackIg?.trim()) return fallbackIg.trim();
  }

  // Check event scope org (college) if organizer didn't have it directly
  if (event.scope_org) {
    const scopeCampus = event.scope_org.title ?? event.scope_org.name;
    if (scopeCampus?.trim()) return scopeCampus.trim();
  }

  // Check event creator
  if (event.created_by?.full_name?.trim()) {
    return event.created_by.full_name.trim();
  }

  return "µLearn";
}

/**
 * Normalizes a publisher name for alphabetical collation.
 * Specifically treats "µ" / "μ" (Greek mu) as "m", so "µLearn" / "μLearn"
 * correctly sorts under the letter "M" (alongside "Mar Baselios", "Muniversity")
 * instead of after "Z" (Unicode codepoint 956).
 */
export function normalizePublisherForSort(name: string): string {
  if (!name) return "";
  return name
    .replace(/[µμ]/gi, "m")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Returns a deduplicated, alphabetically sorted array of all publisher names
 * extracted from the provided events ("the bucket will be all those publishers who created the events").
 */
export function getPublisherBucket(events: EventWithPublisher[]): string[] {
  if (!Array.isArray(events) || events.length === 0) return [];

  const set = new Set<string>();
  for (const event of events) {
    const name = getEventPublisherName(event);
    if (name) {
      set.add(name);
    }
  }

  return Array.from(set).sort((a, b) => {
    const normA = normalizePublisherForSort(a);
    const normB = normalizePublisherForSort(b);
    return normA.localeCompare(normB, undefined, { sensitivity: "base" });
  });
}

/**
 * Sorts an array of events by their resolved publisher / college name.
 * When publishers are identical, falls back to sorting by title.
 */
export function sortEventsByPublisher<T extends EventWithPublisher>(
  events: T[],
  direction: "asc" | "desc" = "asc",
): T[] {
  return [...events].sort((a, b) => {
    const pubA = getEventPublisherName(a);
    const pubB = getEventPublisherName(b);
    const normA = normalizePublisherForSort(pubA);
    const normB = normalizePublisherForSort(pubB);
    const cmp = normA.localeCompare(normB, undefined, { sensitivity: "base" });
    if (cmp !== 0) {
      return direction === "asc" ? cmp : -cmp;
    }
    const titleA = (a.title ?? "").trim();
    const titleB = (b.title ?? "").trim();
    return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAcronyms(str: string): string[] {
  if (!str) return [];
  const cleaned = str.replace(/\([^)]*\)/g, "").trim();
  const words = cleaned.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const stopWords = new Set([
    "of",
    "and",
    "in",
    "for",
    "the",
    "at",
    "to",
    "a",
    "an",
  ]);

  // 1. First letter of major words (excluding stop words)
  const majorWords = words.filter((w) => !stopWords.has(w.toLowerCase()));
  const acronym1 = majorWords
    .map((w) => w[0])
    .join("")
    .toLowerCase();

  // 2. First letter of ALL words
  const acronym2 = words
    .map((w) => w[0])
    .join("")
    .toLowerCase();

  // 3. If any word is already an acronym (e.g. "TKM College of Engineering" -> T,K,M, C, E), expand it
  const expandedWords: string[] = [];
  for (const w of majorWords) {
    if (w.length > 1 && w.length <= 4 && w === w.toUpperCase()) {
      expandedWords.push(...w.split(""));
    } else {
      expandedWords.push(w[0]);
    }
  }
  const acronym3 = expandedWords.join("").toLowerCase();

  return Array.from(new Set([acronym1, acronym2, acronym3])).filter(
    (a) => a.length >= 2,
  );
}

function matchesCollegeCode(target: string, code: string): boolean {
  if (!target || !code) return false;
  const trimmedTarget = target.trim();
  const trimmedCode = code.trim();
  if (trimmedTarget.toLowerCase() === trimmedCode.toLowerCase()) {
    return true;
  }
  const escaped = escapeRegex(trimmedCode);
  const boundaryRegex = new RegExp(`\\b${escaped}\\b`, "i");
  if (boundaryRegex.test(trimmedTarget)) {
    return true;
  }

  const cleanCode = trimmedCode.replace(/[\s-]+/g, "").toLowerCase();
  const cleanTarget = trimmedTarget.replace(/[\s-]+/g, "").toLowerCase();

  // Match acronyms (e.g. "MBCET" or "NIT AP" matches "Mar Baselios College..." or "NIT Andhra Pradesh")
  const targetAcronyms = getAcronyms(trimmedTarget);
  if (targetAcronyms.includes(cleanCode)) {
    return true;
  }

  const codeAcronyms = getAcronyms(trimmedCode);
  if (codeAcronyms.includes(cleanTarget)) {
    return true;
  }

  if (targetAcronyms.some((ta) => codeAcronyms.includes(ta))) {
    return true;
  }

  return false;
}

/**
 * Determines whether an event was published by / associated with the user's college.
 */
export function isEventFromUserCollege(
  event: EventWithPublisher,
  userProfile?: {
    college_id?: string | null;
    college_code?: string | null;
  } | null,
): boolean {
  if (!event || !userProfile) return false;

  const userCollegeId = userProfile.college_id?.trim();
  const userCollegeCode = userProfile.college_code?.trim().toLowerCase();

  if (!userCollegeId && !userCollegeCode) return false;

  const org = event.organizer;
  const candidateCampuses = [
    org?.campus,
    org?.organiser_campus,
    event.scope_org,
  ].filter(Boolean);

  for (const campus of candidateCampuses) {
    if (!campus) continue;
    const eventCampusId = campus.id;
    const eventCampusTitle = campus.title ?? campus.name ?? "";
    const eventCampusCode = (campus as { code?: string }).code;

    // 1. Match by college_id
    if (userCollegeId && eventCampusId && userCollegeId === eventCampusId) {
      return true;
    }

    // 2. Match by explicit campus code
    if (
      userCollegeCode &&
      eventCampusCode &&
      eventCampusCode.trim().toLowerCase() === userCollegeCode
    ) {
      return true;
    }

    // 3. Match by college_code against campus title/name using word boundaries
    if (
      userCollegeCode &&
      eventCampusTitle &&
      matchesCollegeCode(eventCampusTitle, userCollegeCode)
    ) {
      return true;
    }
  }

  // 4. Match against the resolved publisher name using word boundaries
  if (userCollegeCode) {
    const publisherName = getEventPublisherName(event);
    if (publisherName && matchesCollegeCode(publisherName, userCollegeCode)) {
      return true;
    }
  }

  return false;
}
