"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  type CollaborationPageParams,
  type CompanyFeedbackPayload,
  fetchCompanyFeedbackList,
  fetchCompanyImpactReport,
  setImpactReportPublished,
  submitCompanyFeedback,
} from "../api";
import type { PublicCompanyProfile } from "../schemas/jobs.schema";
import type { CompanyProfile } from "../types";
import { COMPANY_KEYS, usePublicCompanyProfile } from "./use-company-profile";

export const FEEDBACK_KEYS = {
  all: ["company-feedback"] as const,
  list: (params?: CollaborationPageParams) =>
    [...FEEDBACK_KEYS.all, "list", params ?? {}] as const,
  impactReport: () => [...FEEDBACK_KEYS.all, "impact-report"] as const,
};

export function useCompanyFeedbackList(params?: CollaborationPageParams) {
  return useQuery({
    queryKey: FEEDBACK_KEYS.list(params),
    queryFn: () => fetchCompanyFeedbackList(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

/** Learner rates a company after a finished interaction. */
export function useSubmitCompanyFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyFeedbackPayload) =>
      submitCompanyFeedback(payload),
    onSuccess: () => {
      toast.success("Thanks for your feedback");
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to submit feedback" }),
      );
    },
  });
}

export function useCompanyImpactReport() {
  return useQuery({
    queryKey: FEEDBACK_KEYS.impactReport(),
    queryFn: fetchCompanyImpactReport,
    refetchOnWindowFocus: false,
  });
}

/**
 * Whether the impact summary is on the public profile. Prefers the owner
 * profile's publish_impact_report (BE-4); until the backend sends it, the
 * public profile's impact_summary (null unless opted in) stands in.
 */
export function useImpactReportPublished(
  slug: string | undefined,
  ownFlag?: boolean | null,
): boolean | undefined {
  const hasOwnFlag = typeof ownFlag === "boolean";
  const { data } = usePublicCompanyProfile(hasOwnFlag ? undefined : slug);
  if (hasOwnFlag) return ownFlag;
  if (!data) return undefined;
  return data.impact_summary != null;
}

export function useSetImpactReportPublished(slug: string | undefined) {
  const queryClient = useQueryClient();
  const key = COMPANY_KEYS.publicProfile(slug ?? "");
  return useMutation({
    mutationFn: (publish: boolean) => setImpactReportPublished(publish),
    // Flip the switch immediately; roll back if the backend refuses.
    onMutate: async (publish) => {
      await queryClient.cancelQueries({ queryKey: key });
      await queryClient.cancelQueries({ queryKey: COMPANY_KEYS.profile() });
      const previous = queryClient.getQueryData<PublicCompanyProfile>(key);
      const previousOwn = queryClient.getQueryData<CompanyProfile>(
        COMPANY_KEYS.profile(),
      );
      if (previous) {
        queryClient.setQueryData<PublicCompanyProfile>(key, {
          ...previous,
          impact_summary: publish ? (previous.impact_summary ?? {}) : null,
        });
      }
      if (previousOwn) {
        queryClient.setQueryData<CompanyProfile>(COMPANY_KEYS.profile(), {
          ...previousOwn,
          publish_impact_report: publish,
        });
      }
      return { previous, previousOwn };
    },
    onError: (error, _publish, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      if (context?.previousOwn) {
        queryClient.setQueryData(COMPANY_KEYS.profile(), context.previousOwn);
      }
      toast.error(
        getApiResponseError(error, {
          fallback: "Couldn't update your public profile",
        }),
      );
    },
    onSuccess: (_, publish) => {
      toast.success(
        publish
          ? "Your impact report is now on your public profile"
          : "Your impact report is no longer on your public profile",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.profile() });
    },
  });
}
