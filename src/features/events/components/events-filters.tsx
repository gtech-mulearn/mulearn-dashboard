import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface EventsFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
  eventCounts?: {
    active: number;
    draft: number;
    past: number;
  };
}

export function EventsFilters({
  onSearch,
  onCategoryChange,
  selectedCategory,
}: EventsFiltersProps) {
  const categories = [
    "All Category",
    "Music",
    "Art & Design",
    "Food & Culinary",
    "Technology",
    "Health & Wellness",
    "Fashion",
    "Outdoor & Adventure",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search event, location, etc"
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>

        <div className="flex-1" />

        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-lg">
                {selectedCategory === "All Category"
                  ? "All Category"
                  : selectedCategory}{" "}
                ▼
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map((cat) => (
                <DropdownMenuItem
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                >
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="rounded-lg">
            This Month ▼
          </Button>
        </div>
      </div>
    </div>
  );
}
