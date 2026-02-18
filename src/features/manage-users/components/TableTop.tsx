import { Download } from "lucide-react";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { useManageUsersCsvDownload } from "../hooks";
import { SearchBar } from "./SearchBar";

type Props = {
  onSearchText?: (data: string) => void;
  onPerPageNumber?: (data: number) => void;
  CSV?: string;
};

const TableTop = ({ onSearchText, CSV = endpoints.manageUsers.csv }: Props) => {
  const { downloadCsv, isDownloading } = useManageUsersCsvDownload(CSV);

  const handleData = (search: string) => {
    onSearchText?.(search);
  };

  const handleClick = async () => {
    try {
      await downloadCsv();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download CSV",
      );
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-3 md:flex-row md:items-center md:justify-between">
      <SearchBar onSearch={handleData} />
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={isDownloading || !CSV}
        className="h-10 rounded-xl"
      >
        <Download className="mr-2 size-4" />
        CSV
      </Button>
    </div>
  );
};

export default TableTop;
