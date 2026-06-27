import type { ListParams } from "../api";

export const weeklyTwitchesKeys = {
  all: ["weekly-twitches"] as const,

  officeHours: () => [...weeklyTwitchesKeys.all, "office-hours"] as const,
  officeHoursList: (params: ListParams) =>
    [...weeklyTwitchesKeys.officeHours(), "list", params] as const,
  officeHoursDetail: (id: string) =>
    [...weeklyTwitchesKeys.officeHours(), "detail", id] as const,

  smt: () => [...weeklyTwitchesKeys.all, "salt-mango-tree"] as const,
  smtList: (params: ListParams) =>
    [...weeklyTwitchesKeys.smt(), "list", params] as const,
  smtDetail: (id: string) =>
    [...weeklyTwitchesKeys.smt(), "detail", id] as const,

  is: () => [...weeklyTwitchesKeys.all, "inspiration-station"] as const,
  isList: (params: ListParams) =>
    [...weeklyTwitchesKeys.is(), "list", params] as const,
  isDetail: (id: string) => [...weeklyTwitchesKeys.is(), "detail", id] as const,
};
