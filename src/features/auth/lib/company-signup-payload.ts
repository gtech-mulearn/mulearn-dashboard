/**
 * Company signup payload for POST /api/v1/dashboard/company/register/.
 *
 * Release 1.91 validates the JSON columns strictly:
 *   perks        → list of strings
 *   testimonials → list of objects (not collected at signup)
 *   gallery      → list of objects (`{ image_url, sort_order }`, the shape the
 *                  public profile renders)
 * and requires `verification_document_url`, which admins review before they
 * can verify the company.
 */
import type { CompanyDetailsValues } from "../components/register-role-details";
import type { CompanySignupRequest } from "../schemas/register.schema";

/** Trim and add https:// to a bare domain; drop data:/blob: URLs. */
export function normalizeUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed || /^(data|blob):/i.test(trimmed)) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** "Free lunch\nRemote, Gym" → ["Free lunch", "Remote", "Gym"]. */
export function splitPerks(text: string | undefined): string[] | undefined {
  const perks = (text ?? "")
    .split(/[\n,]/)
    .map((perk) => perk.trim())
    .filter(Boolean);
  return perks.length > 0 ? perks : undefined;
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildCompanySignupPayload(
  values: CompanyDetailsValues,
): CompanySignupRequest {
  const gallery = (values.gallery ?? [])
    .map((url) => normalizeUrl(url))
    .filter((url): url is string => Boolean(url))
    .map((image_url, sort_order) => ({ image_url, sort_order }));

  const payload: CompanySignupRequest = {
    name: values.companyName?.trim() ?? "",
    description: values.companyDescription?.trim() ?? "",
    verification_document_url:
      normalizeUrl(values.verification_document_url) ?? "",
    logo: normalizeUrl(values.logo),
    short_pitch: nonEmpty(values.shortPitch),
    industry_sector: nonEmpty(values.industrySector),
    website_link: normalizeUrl(values.websiteLink),
    email: nonEmpty(values.email),
    location: nonEmpty(values.location),
    district_id: nonEmpty(values.districtId),
    state_id: nonEmpty(values.stateId),
    country_id: nonEmpty(values.countryId),
    legal_name: nonEmpty(values.legalName),
    registration_number: nonEmpty(values.registrationNumber),
    tax_id: nonEmpty(values.taxId),
    company_size: nonEmpty(values.companySize),
    linkedin_url: normalizeUrl(values.linkedinUrl),
    founded_year: values.foundedYear || undefined,
    remote_policy: nonEmpty(values.remotePolicy),
    culture_text: nonEmpty(values.cultureText),
    tech_stack:
      values.techStack && values.techStack.length > 0
        ? values.techStack
        : undefined,
    perks: splitPerks(values.perks),
    gallery: gallery.length > 0 ? gallery : undefined,
  };

  // Drop unset keys so the request only carries what the company filled in.
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as CompanySignupRequest;
}
