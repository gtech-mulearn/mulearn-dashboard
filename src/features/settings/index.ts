export {
  changeOrganization,
  changePassword,
  getColleges,
  getDepartments,
} from "./api";
export {
  useChangeOrganization,
  useChangePassword,
  useColleges,
  useDepartments,
} from "./hooks";
export type {
  ChangeOrganizationFormValues,
  ChangeOrganizationResponse,
  ChangePasswordFormValues,
  ChangePasswordResponse,
  College,
  Department,
} from "./schemas";
export {
  ChangeOrganizationRequestSchema,
  ChangeOrganizationResponseSchema,
  ChangePasswordRequestSchema,
  ChangePasswordResponseSchema,
  CollegeResponseSchema,
  CollegeSchema,
  DepartmentResponseSchema,
  DepartmentSchema,
} from "./schemas";
