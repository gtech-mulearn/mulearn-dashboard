import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const ProjectStatusSchema = z.enum(["draft", "published", "archived"]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectImageSchema = z.object({ image: z.string() });

export const ProjectLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
  position: z.number().default(0),
});
export type ProjectLink = z.infer<typeof ProjectLinkSchema>;

export const ProjectSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  icon: z.string().nullable().optional(),
});
export type ProjectSkill = z.infer<typeof ProjectSkillSchema>;

export const ProjectMemberSchema = z.object({
  id: z.string(),
  is_linked: z.boolean(),
  user_id: z.string().nullable().optional(),
  muid: z.string().nullable().optional(),
  full_name: z.string(),
  profile_pic: z.string().nullable().optional(),
  external_name: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  created_at: z.string(),
});
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;

export const VoteSchema = z.object({
  id: z.string(),
  vote: z.enum(["upvote", "downvote"]),
  project: z.string(),
  user: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ProjectVote = z.infer<typeof VoteSchema>;

export const ProjectCommentSchema = z.object({
  id: z.string(),
  comment: z.string(),
  project: z.string(),
  user: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ProjectComment = z.infer<typeof ProjectCommentSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: ProjectStatusSchema,
  logo: z.string().nullable().optional(),
  images: z.array(ProjectImageSchema).default([]),
  links: z.array(ProjectLinkSchema).default([]),
  skills: z.array(ProjectSkillSchema).default([]),
  members: z.array(ProjectMemberSchema).default([]),
  votes: z.array(VoteSchema).default([]),
  comments: z.array(ProjectCommentSchema).default([]),
  created_by: z.string().nullable().optional(),
  created_by_id: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const PaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().nullable(),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const ProjectsListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.object({
      Projects: z.array(ProjectSchema),
    }),
    pagination: PaginationSchema.optional(),
  }),
);
export const ProjectDetailResponseSchema = ApiResponseSchema(
  z.object({ Project: ProjectSchema }),
);
export const MembersListResponseSchema = ApiResponseSchema(
  z.object({ Members: z.array(ProjectMemberSchema) }),
);
export const MemberMutationResponseSchema = ApiResponseSchema(
  z.object({ Member: ProjectMemberSchema }),
);
export const VoteMutationResponseSchema = ApiResponseSchema(
  z.object({ Vote: VoteSchema }),
);
export const CommentMutationResponseSchema = ApiResponseSchema(
  z.object({ Comment: ProjectCommentSchema }),
);
export const EmptyResponseSchema = ApiResponseSchema(z.unknown());

export const ProjectLinkFormSchema = z.object({
  label: z.string().min(1, "Label is required").max(50),
  url: z.string().url("Must be a valid URL"),
});
export type ProjectLinkFormValue = z.infer<typeof ProjectLinkFormSchema>;

export const ProjectFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(50),
  description: z.string().min(1, "Description is required"),
  status: ProjectStatusSchema,
  links: z.array(ProjectLinkFormSchema),
  skill_ids: z.array(z.string()),
});
export type ProjectFormValues = z.infer<typeof ProjectFormSchema>;

export type AddMemberRequest =
  | { muid: string; role?: string }
  | { user_id: string; role?: string }
  | { external_name: string; role?: string };
