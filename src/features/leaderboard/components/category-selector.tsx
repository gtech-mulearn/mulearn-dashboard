import { Award, Building2, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Category,
  CategorySelectorProps,
} from "../types/leaderboard.type";

const categories: { value: Category; label: string; icon: ReactNode }[] = [
  {
    value: "students",
    label: "Students",
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: "campus",
    label: "Campus",
    icon: <Building2 className="w-5 h-5" />,
  },
  // {
  //   value: "wadhwani",
  //   label: "Wadhwani",
  //   icon: <Award className="w-5 h-5" />,
  // },
];

export function CategorySelector({
  selected,
  onChange,
}: CategorySelectorProps) {
  return (
    <>
      <div className="w-full mt-5 md:hidden flex justify-center">
        <Select value={selected} onValueChange={(v) => onChange(v as Category)}>
          <SelectTrigger className="w-[200px] border-primary text-primary focus:ring-primary">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>

          <SelectContent>
            {categories.map((category) => (
              <SelectItem
                key={category.value}
                value={category.value}
                className="text-primary focus:bg-primary/10 focus:text-primary"
              >
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex flex-wrap gap-3 w-full md:w-auto">
        {categories.map((category) => {
          const isSelected = selected === category.value;
          return (
            <Button
              key={category.value}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onChange(category.value)}
              className="flex items-center justify-center gap-3 font-semibold uppercase tracking-tight"
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
