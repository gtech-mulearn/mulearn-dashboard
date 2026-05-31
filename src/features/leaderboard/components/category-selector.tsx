import { Award, Building2, GraduationCap, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, CategorySelectorProps } from "@/features/leaderboard";

const categories: { value: Category; label: string; icon: ReactNode }[] = [
  {
    value: "students",
    label: "Students",
    icon: <Users className="w-4 h-4" />,
  },
  {
    value: "campus",
    label: "Campus",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    value: "wadhwani",
    label: "Wadhwani",
    icon: <Award className="w-4 h-4" />,
  },
  {
    value: "mentors",
    label: "Mentors",
    icon: <GraduationCap className="w-4 h-4" />,
  },
];

export function CategorySelector({
  selected,
  onChange,
}: CategorySelectorProps) {
  return (
    <>
      {/* Mobile: dropdown */}
      <div className="w-full md:hidden flex justify-center">
        <Select value={selected} onValueChange={(v) => onChange(v as Category)}>
          <SelectTrigger className="w-48 rounded-full border-border">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: pill segment group */}
      <div className="hidden md:inline-flex items-center gap-1 bg-muted rounded-full p-1">
        {categories.map((category) => {
          const isSelected = selected === category.value;
          return (
            <Button
              key={category.value}
              type="button"
              variant={null}
              size={null}
              onClick={() => onChange(category.value)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </Button>
          );
        })}
      </div>
    </>
  );
}
