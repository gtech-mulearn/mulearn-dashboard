import { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  onSearch: (data: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

export const SearchBar = ({ onSearch, placeholder, onClear }: Props) => {
  const [search, setSearch] = useState("");

  const onChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const sanitizedInput = inputValue.replace(/[<>/]/g, "");
    setSearch(sanitizedInput);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(search.trim());
  };

  const clearInput = () => {
    setSearch("");
    if (onClear) onClear();
    else onSearch("");
  };

  return (
    <form className="flex w-full items-center gap-2" onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder ?? "Search"}
          onChange={onChangeSearch}
          value={search}
          className="h-10 rounded-xl border-border/60 pr-9"
        />
        {search && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={clearInput}
          >
            <HiOutlineX />
          </button>
        )}
      </div>
      <Button type="submit" className="h-10 rounded-xl">
        Search
      </Button>
    </form>
  );
};
