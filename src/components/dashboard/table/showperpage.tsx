interface ShowPerPageProps {
  options: number[];
  selectedOption: number;
  onOptionChange: (value: number) => void;
}

const ShowPerPage = ({
  options,
  selectedOption,
  onOptionChange,
}: ShowPerPageProps) => {
  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    onOptionChange(value);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="showPerPage" className="text-sm text-muted-foreground">
        Rows per page:
      </label>
      <select
        id="showPerPage"
        value={selectedOption}
        onChange={handleOptionChange}
        className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ShowPerPage;
