export type ScopedSessionType =
  | "IG_SESSION"
  | "CAMPUS_SESSION"
  | "COMPANY_SESSION";

/** The global mentor grant: may create a session for any interest group. */
export const GLOBAL_MENTOR_SCOPE = "MENTOR";

const SESSION_TYPE_BY_SCOPE: Record<string, ScopedSessionType> = {
  IG_MENTOR: "IG_SESSION",
  CAMPUS_MENTOR: "CAMPUS_SESSION",
  COMPANY_MENTOR: "COMPANY_SESSION",
};

/** Mirrors SessionCreateSerializer's session_type → scope grant map. */
export function sessionTypeForScope(
  scopeType: string,
): ScopedSessionType | null {
  return SESSION_TYPE_BY_SCOPE[scopeType] ?? null;
}

export interface SessionScopeOption {
  /** Select value: "<scope_type>:<scope_id>", or "MENTOR" for a global grant. */
  value: string;
  scopeType: string;
  /** The grant's scope_id = the session's entity_id ("" for MENTOR). */
  entityId: string;
}

/**
 * One "Session for" option per active grant from persona/current. A global
 * MENTOR grant becomes a single option whose interest group is picked
 * separately; unknown scope types are dropped.
 */
export function scopeOptions(
  scopes: { scope_type: string; scope_id: string | null }[],
): SessionScopeOption[] {
  const options: SessionScopeOption[] = [];
  const seen = new Set<string>();
  for (const scope of scopes) {
    let option: SessionScopeOption | null = null;
    if (scope.scope_type === GLOBAL_MENTOR_SCOPE) {
      option = {
        value: GLOBAL_MENTOR_SCOPE,
        scopeType: "MENTOR",
        entityId: "",
      };
    } else if (sessionTypeForScope(scope.scope_type) && scope.scope_id) {
      option = {
        value: `${scope.scope_type}:${scope.scope_id}`,
        scopeType: scope.scope_type,
        entityId: scope.scope_id,
      };
    }
    if (option && !seen.has(option.value)) {
      seen.add(option.value);
      options.push(option);
    }
  }
  return options;
}

export interface ScopeLabelContext {
  igs: { id: string; name: string }[];
  /** The mentor's applications: org id + its display name. */
  applications: { org?: string | null; company?: string | null }[];
}

/** Human label for a scope option, e.g. "GEC Thrissur · Campus". */
export function scopeLabel(
  option: SessionScopeOption,
  { igs, applications }: ScopeLabelContext,
): string {
  const orgName = () =>
    applications.find((a) => a.org && a.org === option.entityId)?.company;
  switch (option.scopeType) {
    case "IG_MENTOR":
      return `${igs.find((ig) => ig.id === option.entityId)?.name ?? "Interest group"} · Interest group`;
    case "CAMPUS_MENTOR":
      return `${orgName() ?? "Your campus"} · Campus`;
    case "COMPANY_MENTOR":
      return `${orgName() ?? "Your company"} · Company`;
    default:
      return "Any interest group";
  }
}
