import z from "zod";

export const ChangePasswordRequestSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const ChangePasswordResponseSchema = z.object({
  hasError: z.boolean(),
  statusCode: z.number(),
  message: z
    .object({
      general: z.array(z.string()).optional(),
    })
    .optional(),
  response: z.object({}).loose(),
});

export const CollegeSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const CollegeResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number(),
  message: z
    .object({
      general: z.array(z.string()).optional(),
    })
    .optional(),
  response: z.object({
    colleges: z.array(CollegeSchema),
  }),
});

export type College = z.infer<typeof CollegeSchema>;

export const DepartmentSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const DepartmentResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number(),
  message: z
    .object({
      general: z.array(z.string()).optional(),
    })
    .optional(),
  response: z.object({
    departments: z.array(DepartmentSchema),
  }),
});

export type Department = z.infer<typeof DepartmentSchema>;

export const ChangeOrganizationRequestSchema = z.object({
  department: z.string().min(1, "Department is required"),
  organization: z.string().min(1, "Organization is required"),
});

export const ChangeOrganizationResponseSchema = z.object({
  hasError: z.boolean(),
  statusCode: z.number(),
  message: z
    .object({
      general: z.array(z.string()).optional(),
    })
    .optional(),
  response: z.object({}).loose(),
});

export type ChangePasswordFormValues = z.infer<
  typeof ChangePasswordRequestSchema
>;

export type ChangePasswordResponse = z.infer<
  typeof ChangePasswordResponseSchema
>;

export type ChangeOrganizationFormValues = z.infer<
  typeof ChangeOrganizationRequestSchema
>;
export type ChangeOrganizationResponse = z.infer<
  typeof ChangeOrganizationResponseSchema
>;
