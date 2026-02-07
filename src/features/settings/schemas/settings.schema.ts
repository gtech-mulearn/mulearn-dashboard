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
  message: z.object({
    general: z.array(z.string()),
  }),
  response: z.object({}).loose(),
});

export type ChangePasswordFormValues = z.infer<
  typeof ChangePasswordRequestSchema
>;
export type ChangePasswordResponse = z.infer<
  typeof ChangePasswordResponseSchema
>;
