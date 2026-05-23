import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { authStore } from "@/lib/auth";
import { env } from "../../../../config/env";
import {
  type AddMemberRequest,
  CommentMutationResponseSchema,
  EmptyResponseSchema,
  MemberMutationResponseSchema,
  MembersListResponseSchema,
  type Project,
  ProjectDetailResponseSchema,
  type ProjectFormValues,
  type ProjectLinkFormValue,
  type ProjectMember,
  type ProjectStatus,
  ProjectsListResponseSchema,
  VoteMutationResponseSchema,
} from "../schemas";

interface ListOpts {
  status?: ProjectStatus;
  perPage?: number;
}

export async function listProjectsForMuid(
  muid: string,
  opts: ListOpts = {},
): Promise<Project[]> {
  const params = new URLSearchParams({
    muid,
    perPage: String(opts.perPage ?? 50),
  });
  if (opts.status) params.set("status", opts.status);
  const res = await apiClient.get(
    `${endpoints.projects.list}?${params}`,
    ProjectsListResponseSchema,
  );
  return res.response.data.Projects;
}

export async function getProject(id: string): Promise<Project> {
  const res = await apiClient.get(
    endpoints.projects.detail(id),
    ProjectDetailResponseSchema,
  );
  return res.response.Project;
}

interface SaveArgs {
  values: ProjectFormValues;
  logo?: File;
  images?: File[];
}

function buildProjectFormData(args: SaveArgs): FormData {
  const fd = new FormData();
  if (args.values.title !== undefined) fd.append("title", args.values.title);
  if (args.values.description !== undefined)
    fd.append("description", args.values.description);
  if (args.values.status !== undefined) fd.append("status", args.values.status);
  if (args.values.links !== undefined) {
    fd.append(
      "links_json",
      JSON.stringify(args.values.links satisfies ProjectLinkFormValue[]),
    );
  }
  if (args.values.skill_ids !== undefined) {
    fd.append("skill_ids_json", JSON.stringify(args.values.skill_ids));
  }
  if (args.logo) fd.append("logo", args.logo);
  args.images?.forEach((img) => {
    fd.append("images", img);
  });
  return fd;
}

async function postMultipart(
  url: string,
  fd: FormData,
  method: "POST" | "PUT",
): Promise<Project> {
  const token = authStore.getAccessToken();
  const res = await fetch(`${env.NEXT_PUBLIC_DJANGO_API_URL}${url}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  const raw = await res.json();
  if (!res.ok) {
    // Backend returns { general_message: "..." } on error
    const msg =
      typeof raw?.message?.general_message === "string"
        ? raw.message.general_message
        : typeof raw?.message?.general_message === "object"
          ? JSON.stringify(raw.message.general_message)
          : `Server error (${res.status})`;
    throw new Error(msg);
  }
  return ProjectDetailResponseSchema.parse(raw).response.Project;
}

export async function createProject(args: SaveArgs): Promise<Project> {
  return postMultipart(
    endpoints.projects.create,
    buildProjectFormData(args),
    "POST",
  );
}

export async function updateProject(
  id: string,
  args: SaveArgs,
): Promise<Project> {
  return postMultipart(
    endpoints.projects.update(id),
    buildProjectFormData(args),
    "PUT",
  );
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.projects.delete(id),
    undefined,
    EmptyResponseSchema,
  );
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<Project> {
  const res = await apiClient.patch(
    endpoints.projects.status(id),
    { status },
    ProjectDetailResponseSchema,
  );
  return res.response.Project;
}

export async function listMembers(projectId: string): Promise<ProjectMember[]> {
  const res = await apiClient.get(
    endpoints.projects.members(projectId),
    MembersListResponseSchema,
  );
  return res.response.Members;
}

export async function addMember(
  projectId: string,
  payload: AddMemberRequest,
): Promise<ProjectMember> {
  const res = await apiClient.post(
    endpoints.projects.members(projectId),
    payload,
    MemberMutationResponseSchema,
  );
  return res.response.Member;
}

export async function removeMember(
  projectId: string,
  memberId: string,
): Promise<void> {
  await apiClient.delete(
    endpoints.projects.member(projectId, memberId),
    undefined,
    EmptyResponseSchema,
  );
}

export async function voteProject(
  projectId: string,
  vote: "upvote" | "downvote",
) {
  const res = await apiClient.post(
    endpoints.projects.vote,
    { project: projectId, vote },
    VoteMutationResponseSchema,
  );
  return res.response.Vote;
}

export async function deleteVote(voteId: string): Promise<void> {
  await apiClient.delete(
    endpoints.projects.voteById(voteId),
    undefined,
    EmptyResponseSchema,
  );
}

export async function commentOnProject(projectId: string, comment: string) {
  const res = await apiClient.post(
    endpoints.projects.comment,
    { project: projectId, comment },
    CommentMutationResponseSchema,
  );
  return res.response.Comment;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(
    endpoints.projects.commentById(commentId),
    undefined,
    EmptyResponseSchema,
  );
}
