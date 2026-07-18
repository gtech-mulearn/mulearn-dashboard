import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mentorKeys } from "@/features/mentor/hooks/query-keys";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createStudentRequest,
  fetchIncomingRequests,
  fetchMyRequests,
  verifyStudentRequest,
} from "../api/student-requests.api";
import type {
  MentorVerifyRequestValues,
  StudentSessionRequestFormValues,
} from "../schemas";
import { STUDENT_REQUESTS_KEYS } from "./query-keys";

export function useMyRequests(params: {
  status?: string;
  pageIndex?: number;
  perPage?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...STUDENT_REQUESTS_KEYS.my(), params],
    queryFn: () => fetchMyRequests(params),
  });
}

export function useIncomingRequests(params: {
  pageIndex?: number;
  perPage?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...STUDENT_REQUESTS_KEYS.incoming(), params],
    queryFn: () => fetchIncomingRequests(params),
  });
}

export function useCreateStudentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StudentSessionRequestFormValues) =>
      createStudentRequest(data),
    onSuccess: () => {
      toast.success("Session request submitted successfully!");
      queryClient.invalidateQueries({ queryKey: STUDENT_REQUESTS_KEYS.my() });
    },
    onError: (error: any) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit session request",
        }),
      );
    },
  });
}

export function useVerifyStudentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: MentorVerifyRequestValues;
    }) => verifyStudentRequest(id, data),
    onSuccess: (_, { data }) => {
      toast.success(
        data.status === "APPROVED"
          ? "Request approved — the session is now live under My Sessions."
          : "Session request rejected",
      );
      queryClient.invalidateQueries({
        queryKey: STUDENT_REQUESTS_KEYS.incoming(),
      });
      // §10.4: approving reassigns the session to the approving mentor —
      // refresh their own session list so it appears without a reload.
      queryClient.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (error: any) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to process request" }),
      );
    },
  });
}
