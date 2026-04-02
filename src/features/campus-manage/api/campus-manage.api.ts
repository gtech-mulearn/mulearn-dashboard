import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  CampusEvent,
  CampusEventFilters,
  CampusEventsResponse,
  CampusLeaderboardFilters,
  CampusLeaderboardItem,
  CampusLeaderboardResponse,
  CampusOverview,
  ClusterKarmaPoint,
  EventDistributionPoint,
  ExecomMember,
  IgChapter,
  PaginationInfo,
  SocialLink,
  SocialLinks,
  StudentLevelCount,
  TrendPoint,
} from "../types";

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return fallback;
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  return fallback;
};

const safeToString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
};

const asArray = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : [];
};

const pickNestedArray = (record: Record<string, unknown>): unknown[] => {
  const keys = ["data", "results", "items", "rows", "list", "content"];
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
};

const unwrapDataObject = (value: unknown): Record<string, unknown> => {
  const record = asRecord(value);
  const direct =
    asRecord(record.data).constructor === Object ? asRecord(record.data) : null;
  if (direct && Object.keys(direct).length > 0) return direct;

  const response =
    asRecord(record.response).constructor === Object
      ? asRecord(record.response)
      : null;
  if (response && Object.keys(response).length > 0) return response;

  return record;
};

const unwrapDataArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;

  const record = asRecord(value);
  const direct = pickNestedArray(record);
  if (direct.length > 0) return direct;

  const fromData = pickNestedArray(asRecord(record.data));
  if (fromData.length > 0) return fromData;

  const fromResponse = pickNestedArray(asRecord(record.response));
  if (fromResponse.length > 0) return fromResponse;

  return [];
};

const parsePagination = (value: unknown): PaginationInfo => {
  const source = asRecord(value);
  const nestedPagination = asRecord(source.pagination);
  const pagination =
    Object.keys(nestedPagination).length > 0 ? nestedPagination : source;
  return {
    count: toNumber(
      pagination.count ?? pagination.total ?? pagination.total_count,
    ),
    next:
      pagination.next === null
        ? null
        : safeToString(pagination.next, "") || null,
    previous:
      pagination.previous === null
        ? null
        : safeToString(pagination.previous, "") || null,
  };
};

const normalizeTrend = (value: unknown): TrendPoint[] => {
  const list = asArray(value)
    .map((item) => {
      const row = asRecord(item);
      return {
        label: safeToString(row.label || row.date || row.day || row.name, ""),
        value: toNumber(row.value || row.karma || row.points),
      };
    })
    .filter((point) => point.label);

  return list;
};

export const campusManageApi = {
  async getOverview(): Promise<CampusOverview> {
    try {
      const [overviewRaw, weeklyRaw] = await Promise.all([
        apiClient.get<unknown>(endpoints.campusManage.details),
        apiClient.get<unknown>(endpoints.campusManage.weeklyKarma),
      ]);

      const data = unwrapDataObject(overviewRaw);
      const weekly = unwrapDataObject(weeklyRaw);
      const lead = asRecord(data.lead);

      const collegeName = safeToString(
        data.college_name ?? data.collegeName ?? data.name,
        "-",
      );
      const campusCode = safeToString(
        data.campus_code ?? data.campusCode ?? data.code,
        "-",
      );
      const campusZone = safeToString(
        data.campus_zone ?? data.campusZone ?? data.zone,
        "-",
      );
      const campusLevel = toNumber(data.campus_level ?? data.campusLevel);
      const totalKarma = toNumber(data.total_karma ?? data.totalKarma);
      const totalMembers = toNumber(data.total_members ?? data.totalMembers);
      const activeMembers = toNumber(data.active_members ?? data.activeMembers);
      const rank = toNumber(data.rank);
      const campusLead = safeToString(
        lead.campus_lead ?? data.campus_lead ?? data.campusLead,
        "-",
      );
      const enabler = safeToString(lead.enabler ?? data.enabler, "") || null;
      const karma7Day = toNumber(
        data.karma_last_7_days ??
          data.karma_rate_7d ??
          data.karma_7_day ??
          data.karma7Day,
      );
      const karma30Day = toNumber(
        data.karma_last_30_days ??
          data.karma_rate_30d ??
          data.karma_30_day ??
          data.karma30Day,
      );
      const igChaptersCount = toNumber(
        data.active_ig_count ??
          data.ig_chapters_count ??
          data.igCount ??
          data.ig_chapters,
      );
      const orgId =
        safeToString(
          data.id ??
            data.org_id ??
            data.orgId ??
            data.organization_id ??
            data.campus_id ??
            data.campusId,
          "",
        ) || undefined;

      const weeklyTrend = Object.entries(weekly)
        .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
        .map(([key, value]) => ({
          label: key,
          value: toNumber(value),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      const trend =
        weeklyTrend.length > 0
          ? weeklyTrend
          : normalizeTrend(data.trend_7_day ?? data.trend ?? data.trend_7d);

      // Extract social links if available in the main detail response
      const rawLinks = unwrapDataArray(data.social_links ?? data.socialLinks);
      const links = rawLinks.map((item): SocialLink => {
        const row = asRecord(item);
        return {
          id: safeToString(row.id),
          platform: safeToString(row.platform).toLowerCase(),
          url: safeToString(row.url),
        };
      });

      const findByPlatform = (p: string) => links.find((l) => l.platform === p);

      const socialLinks: SocialLinks = {
        items: links,
        instagram: findByPlatform("instagram"),
        linkedin: findByPlatform("linkedin"),
        github: findByPlatform("github"),
        website: findByPlatform("website"),
        twitter: findByPlatform("twitter"),
        facebook: findByPlatform("facebook"),
        youtube: findByPlatform("youtube"),
        discord: findByPlatform("discord"),
        other: findByPlatform("other"),
      };

      return {
        collegeName,
        campusCode,
        campusZone,
        campusLevel,
        totalKarma,
        totalMembers,
        activeMembers,
        rank,
        campusLead,
        enabler,
        karma7Day,
        karma30Day,
        igChaptersCount,
        orgId,
        trend:
          trend.length > 0
            ? trend
            : [
                { label: "7D", value: karma7Day },
                { label: "30D", value: karma30Day },
              ],
        clusterData: [] as ClusterKarmaPoint[],
        socialLinks,
      };
    } catch (e) {
      console.error("[CampusManageApi] getOverview CRASHED:", e);
      throw e;
    }
  },

  async getLeaderboard(
    filters: CampusLeaderboardFilters,
  ): Promise<CampusLeaderboardResponse> {
    const params = new URLSearchParams();
    params.set("page", String(filters.page));

    // Filters supported by both endpoints
    if (filters.alumni !== "all") {
      params.set("is_alumni", String(filters.alumni === "alumni"));
    }
    if (filters.search) params.set("search", filters.search);

    let endpoint: string;

    if (filters.orgId) {
      // Public org-scoped leaderboard (ranked by karma)
      if (filters.ig) params.set("ig_id", filters.ig);
      if (filters.cluster) params.set("cluster", filters.cluster);
      const suffix = params.toString();
      endpoint = suffix
        ? `${endpoints.campusManage.leaderboard(filters.orgId)}?${suffix}`
        : endpoints.campusManage.leaderboard(filters.orgId);
    } else {
      // Auth-scoped: campus lead sees their own campus student list
      const suffix = params.toString();
      endpoint = suffix
        ? `${endpoints.campusManage.studentDetails}?${suffix}`
        : endpoints.campusManage.studentDetails;
    }

    const raw = await apiClient.get<unknown>(endpoint);

    const seenIds = new Set<string>();
    const items = unwrapDataArray(raw)
      .map((item, index): CampusLeaderboardItem | null => {
        // Skip non-object entries (e.g. stale or malformed items)
        if (!item || typeof item !== "object") return null;

        const row = asRecord(item);

        // student-details uses user_id + full_name; org leaderboard uses id + name
        const rawId = safeToString(row.user_id ?? row.id ?? row.muid, "");
        const id = rawId || `leaderboard-${index}`;

        const name = safeToString(row.full_name ?? row.name, "");
        // Skip entries with neither a real id nor a real name
        if (!rawId && !name) return null;

        // Deduplicate by id (guards against stale React Query cache merges)
        if (seenIds.has(id)) return null;
        seenIds.add(id);

        return {
          id,
          name: name || "Unknown",
          muid: safeToString(row.muid, "-"),
          karma: toNumber(row.karma ?? row.total_karma),
          rank: toNumber(row.rank, index + 1),
          level: safeToString(row.level ?? row.level_name, "-"),
          ig: safeToString(row.ig ?? row.ig_chapter ?? row.interest_group, "-"),
          cluster: safeToString(
            row.cluster ?? row.cluster_name ?? row.department,
            "-",
          ),
          alumni: toBoolean(row.alumni ?? row.is_alumni),
        };
      })
      .filter((item): item is CampusLeaderboardItem => item !== null);

    return {
      items,
      pagination: parsePagination(raw),
    };
  },

  async getKarmaByCluster(orgId?: string): Promise<ClusterKarmaPoint[]> {
    if (!orgId) return [];

    const endpoint = endpoints.campusManage.karmaByCluster(orgId);
    const raw = await apiClient.get<unknown>(endpoint);
    const data = unwrapDataObject(raw);

    // The API returns an object where keys are cluster names
    // (technology, design, unclustered, etc.)
    const results = Object.entries(data)
      .filter(
        ([key]) =>
          !["hasError", "statusCode", "message", "response"].includes(key),
      )
      .map(([cluster, details]) => {
        const row = asRecord(details);
        return {
          cluster: safeToString(cluster, "Unknown"),
          karma: toNumber(row.total_karma ?? row.karma ?? row.points),
          memberCount: toNumber(row.member_count ?? row.count),
        };
      })
      .filter((item) => item.karma > 0 || item.memberCount > 0)
      .sort((a, b) => b.karma - a.karma);

    return results;
  },

  async getEventDistribution(): Promise<EventDistributionPoint[]> {
    const raw = await apiClient.get<unknown>(
      endpoints.campusManage.eventsDistribution,
    );

    return unwrapDataArray(raw).map((item) => {
      const row = asRecord(item);
      return {
        tag: safeToString(row.tag ?? row.name ?? row.event_tag, "Other"),
        count: toNumber(row.event_count ?? row.count ?? row.value),
      };
    });
  },

  async getEvents(filters: CampusEventFilters): Promise<CampusEventsResponse> {
    const params = new URLSearchParams();
    params.set("page", String(filters.page));
    if (filters.status) params.set("status", filters.status);
    if (filters.type) params.set("event_type", filters.type);
    if (filters.date) {
      params.set("start_date", filters.date);
      params.set("end_date", filters.date);
    }

    const suffix = params.toString();
    const endpoint = suffix
      ? `${endpoints.campusManage.events}?${suffix}`
      : endpoints.campusManage.events;

    const raw = await apiClient.get<unknown>(endpoint);

    const items = unwrapDataArray(raw).map((item, index): CampusEvent => {
      const row = asRecord(item);
      const tags = asArray(row.tags)
        .map((tag) => safeToString(tag))
        .filter(Boolean);
      const rawId = safeToString(row.id ?? row.slug, "");

      return {
        id: rawId || `event-${index}`,
        title: safeToString(row.title ?? row.name, "Untitled event"),
        date: safeToString(
          row.start_datetime ?? row.date ?? row.event_start_date,
        ),
        endDate: safeToString(
          row.end_datetime ?? row.event_end_date ?? row.end_date,
        ),
        tags,
        interestCount: toNumber(row.interest_count ?? row.interested_users),
        status: safeToString(row.status, "unknown"),
        type: safeToString(
          row.event_type ?? row.organiser_type ?? row.type,
          "general",
        ),
        scope: safeToString(row.scope, "-"),
        organiserType: safeToString(
          row.organiser_type ?? row.organiserType,
          "-",
        ),
        venueType: safeToString(row.venue_type ?? row.venueType, "-"),
        venueCity: safeToString(row.venue_city ?? row.venueCity, "-"),
        coverImage: row.cover_image ? safeToString(row.cover_image) : null,
      };
    });

    return {
      items,
      pagination: parsePagination(raw),
    };
  },

  async getStudentLevels(): Promise<StudentLevelCount[]> {
    const raw = await apiClient.get<unknown>(
      endpoints.campusManage.studentLevel,
    );
    return unwrapDataArray(raw).map((item) => {
      const row = asRecord(item);
      return {
        level: safeToString(row.level ?? row.level_name, "-"),
        count: toNumber(row.count ?? row.student_count),
      };
    });
  },

  async getExecomMembers(): Promise<ExecomMember[]> {
    const raw = await apiClient.get<unknown>(endpoints.campusManage.execom);

    return unwrapDataArray(raw).map((item, index) => {
      const row = asRecord(item);
      const rawId = safeToString(row.user_id ?? row.id ?? row.execom_id, "");
      return {
        id: rawId || `execom-${index}`,
        name: safeToString(row.full_name ?? row.name, "-"),
        muid: safeToString(row.muid, "-"),
        role: safeToString(row.role_title ?? row.role, "member"),
        igChapter: safeToString(
          row.ig_chapter ?? row.ig ?? row.chapter,
          "Campus",
        ),
        profilePic: row.profile_pic ? safeToString(row.profile_pic) : null,
      };
    });
  },

  async getUserProfile(
    muid: string,
  ): Promise<{ name: string; profilePic: string | null }> {
    const raw = await apiClient.get<unknown>(
      endpoints.user.publicProfile(muid),
    );
    const data = unwrapDataObject(raw);
    return {
      name: safeToString(data.full_name ?? data.name, ""),
      profilePic: data.profile_pic ? safeToString(data.profile_pic) : null,
    };
  },

  async addExecomMember(muid: string): Promise<unknown> {
    return apiClient.post<unknown>(endpoints.campusManage.execom, { muid });
  },

  async removeExecomMember(memberId: string): Promise<unknown> {
    return apiClient.delete<unknown>(
      endpoints.campusManage.execomDelete(memberId),
    );
  },

  async transferLeadRole(muid: string): Promise<unknown> {
    return apiClient.post<unknown>(endpoints.campusManage.transferLeadRole, {
      muid,
    });
  },

  async transferEnablerRole(muid: string): Promise<unknown> {
    return apiClient.post<unknown>(endpoints.campusManage.transferEnablerRole, {
      muid,
    });
  },

  async getIgCodes(): Promise<string[]> {
    const raw = await apiClient.get<unknown>(
      endpoints.campusManage.transferIgRole,
    );
    return unwrapDataArray(raw).map((item) => safeToString(item));
  },

  async transferIgRole(muid: string, igCode: string): Promise<unknown> {
    return apiClient.post<unknown>(endpoints.campusManage.transferIgRole, {
      muid,
      ig_code: igCode,
    });
  },

  async changeStudentType(
    memberId: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    return apiClient.patch<unknown>(
      endpoints.campusManage.changeStudentType(memberId),
      data,
    );
  },

  async getIgChapters(): Promise<IgChapter[]> {
    const endpoint = endpoints.campusManage.igChapters;
    const raw = await apiClient.get<unknown>(endpoint);
    const data = unwrapDataArray(raw);

    return data.map((item) => {
      const row = asRecord(item);
      const ig = asRecord(row.ig);
      const lead = asRecord(row.lead);

      return {
        id: safeToString(row.id),
        igId: safeToString(row.ig_id ?? ig.id),
        name: safeToString(row.ig_name ?? ig.name ?? row.name, "IG Chapter"),
        code: safeToString(row.ig_code ?? ig.code),
        icon: safeToString(row.ig_icon ?? ig.icon),
        leadId: safeToString(row.lead_id ?? lead.id),
        lead: safeToString(
          row.lead_name ?? lead.full_name ?? row.lead,
          "No Lead Assistant",
        ),
        membersCount: toNumber(
          row.campus_ig_member_count ?? row.member_count ?? row.members,
        ),
        description: safeToString(row.description),
        isActive: Boolean(row.is_active ?? true),
        execomMembers: [],
      };
    });
  },

  async createIgChapter(data: {
    ig: string;
    description?: string;
    lead?: string;
  }) {
    return apiClient.post(endpoints.campusManage.igChapters, data);
  },

  async updateIgChapter(
    chapterId: string,
    data: { description?: string; lead?: string; is_active?: boolean },
  ) {
    return apiClient.patch(
      endpoints.campusManage.igChapterDetail(chapterId),
      data,
    );
  },

  async deleteIgChapter(chapterId: string) {
    return apiClient.delete(endpoints.campusManage.igChapterDetail(chapterId));
  },

  async upsertSocialLink(data: { platform: string; url: string }) {
    return apiClient.put(endpoints.campusManage.socialLinks, data);
  },

  async deleteSocialLink(linkId: string) {
    return apiClient.delete(endpoints.campusManage.socialLinkDetail(linkId));
  },
};
