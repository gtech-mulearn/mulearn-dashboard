"use client";

import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMentorProfile } from "@/features/mentor/onboarding/hooks/use-onboarding";
import {
  GLOBAL_MENTOR_SCOPE,
  type SessionScopeOption,
  scopeLabel,
  scopeOptions,
} from "@/features/mentor/sessions/lib/session-scope";
import { useTaskIgDropdown } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import {
  usePersonaCurrent,
  usePersonaStatus,
  useSwitchPersona,
} from "../hooks/use-persona";

const LEARNER = "learner";

/**
 * Lets a mentor browse as a learner or act within one of their mentor
 * grants (an IG, campus or company). Hidden when the user has no grant.
 */
export function PersonaSwitcher() {
  const { data: current } = usePersonaCurrent();
  const scopes = current?.available_scopes ?? [];
  const hasScopes = scopes.length > 0;
  const { data: status } = usePersonaStatus(hasScopes);
  const { data: igs = [] } = useTaskIgDropdown();
  const { data: profile } = useMentorProfile(hasScopes);
  const switchPersona = useSwitchPersona();

  if (!hasScopes) return null;

  const options = scopeOptions(scopes);
  const labelFor = (option: SessionScopeOption) =>
    scopeLabel(option, { igs, applications: profile?.applications ?? [] });

  const persona = status?.active_persona ?? current?.active_persona ?? LEARNER;
  const activeType = status?.active_scope_type ?? current?.active_scope_type;
  const activeId = status?.active_scope_id ?? current?.active_scope_id ?? "";
  const activeOption =
    persona === "mentor"
      ? options.find(
          (o) =>
            o.scopeType === activeType &&
            (o.scopeType === GLOBAL_MENTOR_SCOPE || o.entityId === activeId),
        )
      : undefined;
  const activeValue =
    persona === "mentor" ? (activeOption?.value ?? "") : LEARNER;
  const triggerLabel =
    persona === "mentor"
      ? status?.active_scope_name ||
        (activeOption ? labelFor(activeOption) : "Mentor")
      : "Learner";

  const choose = (value: string) => {
    if (value === activeValue) return;
    if (value === LEARNER) {
      switchPersona.mutate(
        { persona: "learner" },
        { onSuccess: () => toast.success("You're now browsing as a learner") },
      );
      return;
    }
    const option = options.find((o) => o.value === value);
    if (!option) return;
    switchPersona.mutate(
      {
        persona: "mentor",
        scope_type: option.scopeType,
        ...(option.entityId ? { scope_id: option.entityId } : {}),
      },
      {
        onSuccess: () =>
          toast.success(`You're now mentoring as ${labelFor(option)}`),
      },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 max-w-52 gap-2 rounded-full"
          aria-label={`Switch persona (current: ${triggerLabel})`}
          disabled={switchPersona.isPending}
        >
          <ArrowLeftRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden truncate sm:inline">{triggerLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Act as</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={activeValue} onValueChange={choose}>
          <DropdownMenuRadioItem value={LEARNER}>Learner</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {labelFor(option)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
