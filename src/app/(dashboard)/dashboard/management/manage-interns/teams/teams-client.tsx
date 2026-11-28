"use client";

import { Crown, Edit, Plus, Power, Search, Users } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  type TTeam,
  teamSchema,
  useActivateTeam,
  useCreateTeam,
  useDeactivateTeam,
  useIsInternAdmin,
  useManageTeams,
  useUpdateTeam,
} from "@/features/intern";
import { useDebounce } from "@/hooks/use-debounce";

const PER_PAGE = 12;
const SORTS = {
  name: "Name",
  code: "Code",
  created_at: "Created",
} as const;

type FormState = { name: string; code: string; description: string };
const EMPTY_FORM: FormState = { name: "", code: "", description: "" };

export function TeamsPageClient() {
  const isAdmin = useIsInternAdmin();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof typeof SORTS>("name");
  const [includeInactive, setIncludeInactive] = useState(false);

  // null = closed, "new" = create, TTeam = edit
  const [editing, setEditing] = useState<TTeam | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<TTeam | null>(null);

  const { data, isLoading } = useManageTeams({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder: sortBy === "created_at" ? "desc" : "asc",
    include_inactive: (isAdmin && includeInactive) || undefined,
  });
  const teams = data?.data ?? [];
  const pagination = data?.pagination;

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deactivateTeam = useDeactivateTeam();
  const activateTeam = useActivateTeam();

  const openEditor = (team: TTeam | "new") => {
    setForm(
      team === "new"
        ? EMPTY_FORM
        : {
            name: team.name,
            code: team.code,
            description: team.description ?? "",
          },
    );
    setFormError(null);
    setEditing(team);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const done = { onSuccess: () => setEditing(null) };

    // Leads may change only the description.
    if (!isAdmin && editing !== "new") {
      updateTeam.mutate(
        {
          id: editing.id,
          payload: { description: form.description.trim() || null },
        },
        done,
      );
      return;
    }

    const parsed = teamSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid team");
      return;
    }
    const payload = {
      name: parsed.data.name,
      code: parsed.data.code.toUpperCase(),
      description: parsed.data.description || null,
    };
    if (editing === "new") createTeam.mutate(payload, done);
    else updateTeam.mutate({ id: editing.id, payload }, done);
  };

  const isSaving = createTeam.isPending || updateTeam.isPending;
  const leadEditOnly = !isAdmin && editing !== "new";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <Users className="w-10 h-10 text-brand-blue" />
            Teams
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            {isAdmin
              ? "Create, edit, and switch intern teams on or off."
              : "Your team. You can edit its description."}
          </p>
        </div>
        {isAdmin && (
          <Button
            size="lg"
            onClick={() => openEditor("new")}
            className="gap-2 text-xs tracking-widest shadow-lg"
          >
            <Plus className="w-4 h-4" /> New Team
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card/40 border border-border/40 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10 bg-background/50 border-border/50 font-medium"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => {
            setSortBy(v as keyof typeof SORTS);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40 h-10 bg-background/50 font-bold text-xs uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {Object.entries(SORTS).map(([value, label]) => (
              <SelectItem
                key={value}
                value={value}
                className="font-bold text-xs uppercase"
              >
                Sort: {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="teams-include-inactive"
              checked={includeInactive}
              onCheckedChange={(c) => {
                setIncludeInactive(c === true);
                setPage(1);
              }}
            />
            <Label
              htmlFor="teams-include-inactive"
              className="text-xs font-bold text-muted-foreground"
            >
              Show inactive
            </Label>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : teams.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No teams found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`rounded-2xl border border-border/40 bg-card p-5 space-y-3 ${team.is_active ? "" : "opacity-60"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-black text-foreground uppercase tracking-tight truncate">
                    {team.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {team.code}
                    </Badge>
                    {!team.is_active && (
                      <Badge
                        variant="outline"
                        className="text-xs text-destructive border-destructive/30"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title="Edit team"
                    onClick={() => openEditor(team)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  {isAdmin && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title={
                        team.is_active ? "Deactivate team" : "Activate team"
                      }
                      disabled={activateTeam.isPending}
                      className={
                        team.is_active
                          ? "hover:text-destructive"
                          : "hover:text-success"
                      }
                      onClick={() =>
                        team.is_active
                          ? setDeactivateTarget(team)
                          : activateTeam.mutate(team.id)
                      }
                    >
                      <Power className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">
                {team.description || "No description."}
              </p>

              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                <span>{team.active_member_count} active</span>
                <span>{team.member_count} total</span>
              </div>

              {team.leads.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {team.leads.map((lead) => (
                    <Badge
                      key={lead.muid}
                      variant="outline"
                      className="gap-1 text-[10px] text-warning border-warning/30"
                      title={lead.muid}
                    >
                      <Crown className="w-3 h-3" /> {lead.full_name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          perPage={PER_PAGE}
          totalCount={pagination.count}
          handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
          handleNextClick={() =>
            setPage((p) => Math.min(pagination.totalPages, p + 1))
          }
        />
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-widest">
              {editing === "new" ? "New Team" : "Edit Team"}
            </DialogTitle>
            <DialogDescription>
              {leadEditOnly
                ? "Intern Leads can change the description only."
                : "Code is 2-10 letters or digits and is saved in uppercase."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="team-name">Name</Label>
              <Input
                id="team-name"
                value={form.name}
                disabled={leadEditOnly}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-code">Code</Label>
              <Input
                id="team-code"
                value={form.code}
                maxLength={10}
                disabled={leadEditOnly}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="min-h-24 resize-none"
              />
            </div>
            {formError && (
              <p className="text-xs font-semibold text-destructive">
                {formError}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="w-4 h-4" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => !o && setDeactivateTarget(null)}
        title="Deactivate team?"
        description={`${deactivateTarget?.name ?? "This team"} can't be used for new interns. It must have no current members.`}
        confirmLabel="Deactivate"
        variant="warning"
        isPending={deactivateTeam.isPending}
        onConfirm={() => {
          if (!deactivateTarget) return;
          deactivateTeam.mutate(deactivateTarget.id, {
            onSettled: () => setDeactivateTarget(null),
          });
        }}
      />
    </div>
  );
}
