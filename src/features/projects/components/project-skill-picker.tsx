"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
});
type SkillOption = z.infer<typeof SkillSchema>;

const SkillsResponseSchema = z.object({
  response: z.union([
    z.object({ skills: z.array(SkillSchema) }),
    z.array(SkillSchema),
  ]),
});

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export function ProjectSkillPicker({ value, onChange }: Props) {
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const raw = await apiClient.get("/api/v1/dashboard/skill/");
        const parsed = SkillsResponseSchema.safeParse(raw);
        if (parsed.success) {
          const list = Array.isArray(parsed.data.response)
            ? parsed.data.response
            : (parsed.data.response as { skills: SkillOption[] }).skills;
          setSkills(list);
        }
      } catch {
        /* tolerate fetch error */
      }
    })();
  }, []);

  const filtered = q
    ? skills.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
    : skills;
  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((x) => x !== id) : [...value, id],
    );

  return (
    <div className="space-y-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search skills…"
      />
      <div className="flex flex-wrap gap-1">
        {filtered.slice(0, 24).map((s) => (
          <Button
            key={s.id}
            type="button"
            variant={value.includes(s.id) ? "default" : "outline"}
            size="sm"
            onClick={() => toggle(s.id)}
          >
            {s.name}
          </Button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground">No skills match.</p>
        )}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} selected</p>
      )}
    </div>
  );
}
