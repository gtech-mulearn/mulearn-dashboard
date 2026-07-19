import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchMentorGrants, revokeMentorGrant } from "../api/mentor-grants.api";

export const mentorGrantKeys = {
  all: ["mentor-grants"] as const,
  byMentor: (mentorId: string) => ["mentor-grants", mentorId] as const,
};

export function useMentorGrants(mentorId: string, enabled = true) {
  return useQuery({
    queryKey: mentorGrantKeys.byMentor(mentorId),
    queryFn: () => fetchMentorGrants(mentorId),
    enabled: enabled && Boolean(mentorId),
  });
}

export function useRevokeMentorGrant(mentorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (grantId: string) => revokeMentorGrant(mentorId, grantId),
    onSuccess: () => {
      toast.success(
        "Scope removed. Their other scopes and profile are unchanged.",
      );
      void qc.invalidateQueries({
        queryKey: mentorGrantKeys.byMentor(mentorId),
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke scope.",
      ),
  });
}
