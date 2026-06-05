"use client";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { apiClient } from "@/api/client";
import { Badge } from "@/components/ui/badge";
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

/**
 * Tag-style skill picker. Type to search, press Enter or click to add a
 * skill as a tag chip. Only existing skills from the backend are allowed
 * (backend validates skill_ids_json against the Skill table).
 */
export function ProjectSkillPicker({ value, onChange }: Props) {
  const [allSkills, setAllSkills] = useState<SkillOption[]>([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch skills once
  useEffect(() => {
    (async () => {
      try {
        const raw = await apiClient.get("/api/v1/dashboard/skill/");
        const parsed = SkillsResponseSchema.safeParse(raw);
        if (parsed.success) {
          const list = Array.isArray(parsed.data.response)
            ? parsed.data.response
            : (parsed.data.response as { skills: SkillOption[] }).skills;
          setAllSkills(list);
        }
      } catch {
        /* tolerate fetch error */
      }
    })();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter skills: exclude already selected + match query
  const filtered = allSkills.filter(
    (s) =>
      !value.includes(s.id) &&
      (query.length === 0 ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.code.toLowerCase().includes(query.toLowerCase())),
  );

  const addSkill = (skill: SkillOption) => {
    if (!value.includes(skill.id)) {
      onChange([...value, skill.id]);
    }
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeSkill = (id: string) => {
    onChange(value.filter((x) => x !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Add the first matching skill
      if (filtered.length > 0) {
        addSkill(filtered[0]);
      }
    }
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      // Remove the last tag on backspace when input is empty
      removeSkill(value[value.length - 1]);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Resolve skill IDs to names for displaying tags
  const selectedSkills = value
    .map((id) => allSkills.find((s) => s.id === id))
    .filter((s): s is SkillOption => s !== undefined);

  return (
    <div ref={containerRef} className="relative">
      {/* Tag chips + input */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: click focuses the input inside */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard focus handled by the inner input */}
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 min-h-[2.5rem] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedSkills.map((skill) => (
          <Badge
            key={skill.id}
            variant="secondary"
            className="gap-1 pl-2.5 pr-1 py-0.5 text-xs"
          >
            {skill.name}
            <Button
              variant="ghost"
              size="icon"
              className="ml-0.5 h-4 w-4 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(skill.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length === 0 ? "Type a skill and press Enter…" : "Add more…"
          }
          className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-7 min-w-[120px] flex-1 px-0 text-sm"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && query.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border bg-popover shadow-lg">
          {filtered.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">
              No matching skills found.
            </p>
          ) : (
            <ul className="py-1">
              {filtered.slice(0, 12).map((skill) => (
                <li key={skill.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-3 py-2 h-auto text-sm rounded-none"
                    onClick={() => addSkill(skill)}
                  >
                    <span>{skill.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {skill.code}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Count */}
      {value.length > 0 && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {value.length} skill{value.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
