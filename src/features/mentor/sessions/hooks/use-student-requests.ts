import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

export const STUDENT_REQUESTS_KEYS = {
  all: ["student-requests"] as const,
  my: () => [...STUDENT_REQUESTS_KEYS.all, "my"] as const,
  incoming: () => [...STUDENT_REQUESTS_KEYS.all, "incoming"] as const,
};

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
      toast.error(error?.message || "Failed to submit session request");
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
          ? "Session request approved successfully"
          : "Session request rejected",
      );
      queryClient.invalidateQueries({
        queryKey: STUDENT_REQUESTS_KEYS.incoming(),
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to process request");
    },
  });
}
