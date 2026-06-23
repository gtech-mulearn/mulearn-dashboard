import { ApiError, apiClient, authedFetch } from "@/api/client";
import { getApiResponseError } from "@/hooks/use-get-error";
import { endpoints } from "@/api/endpoints";
import {
  type AddMemberRequest,
  CommentMutationResponseSchema,
  EmptyResponseSchema,
  MemberMutationResponseSchema,
  MembersListResponseSchema,
  type Pagination,
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

interface PublicListParams {
  search?: string;
  page?: number;
  perPage?: number;
}

export async function listProjects(params: PublicListParams = {}): Promise<{
  projects: Project[];
  pagination: Pagination;
}> {
  const p = new URLSearchParams({
    perPage: String(params.perPage ?? 12),
    pageIndex: String(params.page ?? 1),
  });
  if (params.search) p.set("search", params.search);
  const res = await apiClient.get(
    `${endpoints.projects.list}?${p}`,
    ProjectsListResponseSchema,
  );
  return {
    projects: res.response.data.Projects,
    pagination: res.response.pagination ?? {
      count: res.response.data.Projects.length,
      totalPages: 1,
      isNext: false,
      isPrev: false,
      nextPage: null,
    },
  };
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
  const res = await authedFetch(url, {
    method,
    body: fd,
  });
  const raw = await res.json();
  if (!res.ok) {
    const msg = getApiResponseError(raw, {
      fallback:
        "Something went wrong while saving the project. Please try again.",
    });
    throw new ApiError(res.status, msg, raw);
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
