import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  addMember,
  commentOnProject,
  createProject,
  deleteComment,
  deleteProject,
  deleteVote,
  removeMember,
  updateProject,
  updateProjectStatus,
  voteProject,
} from "../api";
import type {
  AddMemberRequest,
  ProjectFormValues,
  ProjectStatus,
} from "../schemas";
import { projectsKeys } from "./query-keys";

interface SaveVars {
  values: ProjectFormValues;
  logo?: File;
  images?: File[];
}
interface UpdateVars extends SaveVars {
  id: string;
}

const onMutationError = (error: unknown) => {
  toast.error(
    getApiResponseError(error, { fallback: "Something went wrong." }),
  );
};

export function useCreateProject(muid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: SaveVars) => createProject(vars),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: projectsKeys.byMuid(muid) }),
    onError: onMutationError,
  });
}

export function useUpdateProject(muid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...rest }: UpdateVars) => updateProject(id, rest),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectsKeys.byMuid(muid) });
      qc.invalidateQueries({ queryKey: projectsKeys.detail(project.id) });
    },
    onError: onMutationError,
  });
}

export function useDeleteProject(muid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: projectsKeys.byMuid(muid) }),
    onError: onMutationError,
  });
}

export function useUpdateProjectStatus(muid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      updateProjectStatus(id, status),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectsKeys.byMuid(muid) });
      qc.invalidateQueries({ queryKey: projectsKeys.detail(project.id) });
    },
    onError: onMutationError,
  });
}

export function useAddMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMemberRequest) => addMember(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.members(projectId) });
      qc.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
    },
    onError: onMutationError,
  });
}

export function useRemoveMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(projectId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.members(projectId) });
      qc.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
    },
    onError: onMutationError,
  });
}

export function useVoteProject(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vote: "upvote" | "downvote") => voteProject(projectId, vote),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
    onError: onMutationError,
  });
}

export function useDeleteVote(_projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (voteId: string) => deleteVote(voteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
    onError: onMutationError,
  });
}

export function useCommentOnProject(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment: string) => commentOnProject(projectId, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
    onError: onMutationError,
  });
}

export function useDeleteComment(_projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
    onError: onMutationError,
  });
}
