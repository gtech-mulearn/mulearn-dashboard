export {
  changePassword,
  changeOrganization,
  getColleges,
  getDepartments,
} from "./api";
export {
  useChangeOrganization,
  useChangePassword,
  useColleges,
  useDepartments,
} from "./hooks";
export {
  ChangePasswordRequestSchema,
  ChangePasswordResponseSchema,
  CollegeSchema,
  CollegeResponseSchema,
  DepartmentSchema,
  DepartmentResponseSchema,
  ChangeOrganizationRequestSchema,
  ChangeOrganizationResponseSchema,
} from "./schemas";
export type {
  College,
  Department,
  ChangePasswordFormValues,
  ChangePasswordResponse,
  ChangeOrganizationFormValues,
  ChangeOrganizationResponse,
} from "./schemas";
