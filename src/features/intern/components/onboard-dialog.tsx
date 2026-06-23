"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  Plus,
  Search,
  UploadCloud,
  X,
} from "lucide-react";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useDebounce } from "@/hooks/use-debounce";
import { getApiResponseError } from "@/hooks/use-get-error";
import type { UserResult } from "@/hooks/use-search";
import {
  useBulkImportInterns,
  useDownloadImportTemplate,
  useManageInternsList,
  useOnboardIntern,
} from "../hooks/use-manage-interns";
import type { TBulkImportResponse } from "../types";

interface OnboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildOptions: string[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function OnboardDialog({
  open,
  onOpenChange,
  guildOptions,
}: OnboardDialogProps) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [onboardUser, setOnboardUser] = useState<UserResult | null>(null);
  const [onboardGuild, setOnboardGuild] = useState("");
  const [onboardStatus, setOnboardStatus] = useState("ACTIVE");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResponse, setImportResponse] =
    useState<TBulkImportResponse | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const downloadTemplateMutation = useDownloadImportTemplate();
  const bulkImportMutation = useBulkImportInterns();

  const { data: internsListData } = useManageInternsList({
    page: 1,
    perPage: 1000,
  });

  const excludedMuids = useMemo(() => {
    return (internsListData?.data ?? []).map((i) => i.muid).filter(Boolean);
  }, [internsListData]);

  // Serialize and stabilize excludedMuids to prevent reference changes from triggering useEffect
  const serializedExcluded = excludedMuids.join(",");
  const stableExcluded = useMemo(() => {
    return serializedExcluded.split(",").filter(Boolean);
  }, [serializedExcluded]);

  // Reset states on dialog close
  useEffect(() => {
    if (!open) {
      setOnboardUser(null);
      setOnboardGuild("");
      setOnboardStatus("ACTIVE");
      setSearchQuery("");
      setSearchResults([]);
      setSelectedFile(null);
      setImportResponse(null);
      setMode("single");
    }
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    setIsSearchLoading(true);

    const params = new URLSearchParams({
      search: debouncedSearchQuery.trim(),
      perPage: "15",
      pageIndex: "1",
      sortBy: "",
    });

    apiClient
      .get<{ data: UserResult[] }>(`${endpoints.search.users}?${params}`)
      .then((response) => {
        if (!cancelled) {
          const users = response.data ?? [];
          setSearchResults(
            users.filter((u) => !stableExcluded.includes(u.muid)),
          );
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(
            getApiResponseError(error, { fallback: "Search failed" }),
          );
          setSearchResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchQuery, stableExcluded]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const statusColorClass: Record<string, string> = {
    ACTIVE: "text-success",
    AT_RISK: "text-warning",
    INACTIVE: "text-muted-foreground",
  };

  const onboardMutation = useOnboardIntern();

  const handleSelectUser = (user: UserResult) => {
    setOnboardUser(user);
    clearSearch();
    setPopoverOpen(false);
  };

  const handleClearUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOnboardUser(null);
    clearSearch();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".xlsx")) {
        toast.error("Please upload a valid .xlsx file");
        return;
      }
      setSelectedFile(file);
      setImportResponse(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith(".xlsx")) {
        toast.error("Please upload a valid .xlsx file");
        return;
      }
      setSelectedFile(file);
      setImportResponse(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardUser) {
      toast.error("Please select a user");
      return;
    }
    if (!onboardGuild) {
      toast.error("Please select a guild");
      return;
    }
    onboardMutation.mutate(
      {
        mu_id: onboardUser.muid,
        user_id: onboardUser.id,
        guild: onboardGuild,
        status: onboardStatus,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an Excel file");
      return;
    }
    bulkImportMutation.mutate(selectedFile, {
      onSuccess: (data) => {
        setImportResponse(data);
        setSelectedFile(null);
        toast.success("Bulk import process completed!");
      },
      onError: (err) => {
        toast.error(
          getApiResponseError(err, { fallback: "Bulk import failed" }),
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 rounded-2xl max-h-[calc(100vh-2rem)] flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            Onboard Intern
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === "single"
              ? "Search for a user by MUID and assign their guild and base status. Leave state is handled from approved leave requests."
              : "Upload an Excel spreadsheet containing MuID and guild to assign multiple users as interns at once."}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-background/50 border border-border/40 rounded-xl mt-4 mb-2">
          <button
            type="button"
            onClick={() => {
              setMode("single");
              setImportResponse(null);
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
              mode === "single"
                ? "bg-brand-blue text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Single Onboard
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("bulk");
              setImportResponse(null);
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
              mode === "bulk"
                ? "bg-brand-blue text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bulk Import
          </button>
        </div>

        {mode === "single" ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col min-h-0 w-full"
          >
            <div className="space-y-5 pt-2 my-2 pr-1 overflow-y-auto w-full min-w-0 flex-1">
              {/* Select User (MUID) */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Select User (MUID) <span className="text-destructive">*</span>
                </Label>
                {onboardUser ? (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 border border-brand-blue/20 rounded-2xl shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar className="h-12 w-12 shrink-0 shadow-inner">
                        <AvatarImage
                          src={onboardUser.profile_pic ?? undefined}
                        />
                        <AvatarFallback className="bg-brand-blue/20 text-base font-black text-brand-blue">
                          {getInitials(onboardUser.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-foreground truncate">
                          {onboardUser.full_name}
                        </p>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-blue/60" />
                          @{onboardUser.muid}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearUser}
                      className="text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 shrink-0 px-3.5 h-9 rounded-xl transition-all duration-200"
                    >
                      Change User
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      placeholder="Search intern by name or MUID..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setPopoverOpen(true)}
                      onBlur={() => {
                        setTimeout(() => setPopoverOpen(false), 200);
                      }}
                      className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
                    />
                    {isSearchLoading && (
                      <Spinner className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue animate-spin" />
                    )}
                    {popoverOpen && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200">
                        {searchResults.length === 0 && !isSearchLoading ? (
                          <p className="p-3 text-xs text-muted-foreground text-center">
                            No users found.
                          </p>
                        ) : (
                          searchResults.map((user) => {
                            const isSelected =
                              (onboardUser as UserResult | null)?.muid ===
                              user.muid;
                            return (
                              <button
                                key={user.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectUser(user);
                                }}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-brand-blue/5 text-left transition-colors border-b border-border/10 last:border-0 ${
                                  isSelected ? "bg-success/10" : ""
                                }`}
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarImage
                                      src={user.profile_pic ?? undefined}
                                    />
                                    <AvatarFallback>
                                      {getInitials(user.full_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-foreground">
                                      {user.full_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                      @{user.muid}
                                    </p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
                                    <Check className="h-3.5 w-3.5" /> Selected
                                  </span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Guild */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Guild
                </Label>
                <Select value={onboardGuild} onValueChange={setOnboardGuild}>
                  <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50 rounded-xl">
                    <SelectValue placeholder="Select Guild" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card/95 backdrop-blur-xl border-border/60 rounded-xl"
                  >
                    {guildOptions.map((g) => (
                      <SelectItem
                        key={g}
                        value={g}
                        className="font-bold uppercase text-xs text-foreground"
                      >
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Initial Status */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Initial Status
                </Label>
                <Select value={onboardStatus} onValueChange={setOnboardStatus}>
                  <SelectTrigger
                    className={`w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50 rounded-xl ${statusColorClass[onboardStatus] ?? ""}`}
                  >
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card/95 backdrop-blur-xl border-border/60 rounded-xl"
                  >
                    <SelectItem
                      value="ACTIVE"
                      className="font-bold uppercase text-xs text-success"
                    >
                      Active
                    </SelectItem>
                    <SelectItem
                      value="AT_RISK"
                      className="font-bold uppercase text-xs text-warning"
                    >
                      At Risk
                    </SelectItem>
                    <SelectItem
                      value="INACTIVE"
                      className="font-bold uppercase text-xs text-muted-foreground"
                    >
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={onboardMutation.isPending}
                className="gap-2 text-[10px] tracking-widest h-10 shadow-lg rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={onboardMutation.isPending}
                className="gap-2 text-[10px] tracking-widest h-10 shadow-lg rounded-full bg-brand-blue text-primary-foreground hover:bg-brand-blue/90"
              >
                {onboardMutation.isPending ? "Onboarding..." : "Onboard"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form
            onSubmit={handleBulkSubmit}
            className="flex flex-col min-h-0 w-full"
          >
            <div className="space-y-5 pt-2 my-2 pr-1 overflow-y-auto w-full min-w-0 flex-1">
              {/* Template Download Section */}
              <div className="p-4 bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 border border-brand-blue/20 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">
                    Import Template
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                    Download the template .xlsx file with required headers
                    (`muid`, `guild`).
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => downloadTemplateMutation.mutate()}
                  disabled={downloadTemplateMutation.isPending}
                  variant="outline"
                  className="h-9 px-3.5 text-[10px] tracking-widest font-black uppercase text-brand-blue border-brand-blue/20 hover:bg-brand-blue/10 rounded-xl"
                >
                  {downloadTemplateMutation.isPending ? (
                    <Spinner className="size-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Download className="size-3.5 mr-1.5" />
                  )}
                  Template
                </Button>
              </div>

              {/* Upload Zone */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Upload Excel File (.xlsx)
                </Label>
                {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop zone wrapping native file input */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all duration-200 ${
                    isDragActive
                      ? "border-brand-blue bg-brand-blue/5"
                      : selectedFile
                        ? "border-success/40 bg-success/5"
                        : "border-border/60 hover:border-brand-blue/40 hover:bg-muted/10"
                  }`}
                >
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedFile ? (
                    <div className="text-center">
                      <CheckCircle2 className="size-8 text-success mx-auto mb-2" />
                      <p className="text-xs font-bold text-foreground truncate max-w-[250px] px-2">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="mt-2 text-[10px] font-bold text-destructive hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadCloud className="size-8 text-muted-foreground/60 mx-auto mb-2" />
                      <p className="text-xs font-bold text-foreground">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Supports only .xlsx spreadsheet templates
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Import Results Feedback */}
              {importResponse && (
                <div className="space-y-3 p-4 bg-muted/20 border border-border/40 rounded-2xl">
                  <div className="flex items-center justify-between border-b border-border/10 pb-2">
                    <p className="text-xs font-black uppercase tracking-wider text-foreground">
                      Import Results
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-success/15 text-success rounded-md">
                        {importResponse.success_count} Success
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-destructive/15 text-destructive rounded-md">
                        {importResponse.failed_count} Failed
                      </span>
                    </div>
                  </div>

                  {importResponse.failed_rows &&
                  importResponse.failed_rows.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {importResponse.failed_rows.map((rowErr) => (
                        <div
                          key={`${rowErr.row}-${rowErr.muid}`}
                          className="flex items-start gap-2 p-2 bg-destructive/5 border border-destructive/10 rounded-xl text-[10px]"
                        >
                          <AlertCircle className="size-3.5 text-destructive shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-foreground">
                              Row {rowErr.row} -{" "}
                              <span className="font-mono">@{rowErr.muid}</span>
                            </p>
                            <p className="text-muted-foreground mt-0.5 leading-snug">
                              {rowErr.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-medium text-success text-center py-2 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="size-3.5" /> All rows imported
                      successfully!
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={bulkImportMutation.isPending}
                className="gap-2 text-[10px] tracking-widest h-10 shadow-lg rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={bulkImportMutation.isPending || !selectedFile}
                className="gap-2 text-[10px] tracking-widest h-10 shadow-lg rounded-full bg-brand-blue text-primary-foreground hover:bg-brand-blue/90"
              >
                {bulkImportMutation.isPending ? (
                  <>
                    <Spinner className="size-3 animate-spin mr-1" />
                    Importing...
                  </>
                ) : (
                  "Import Interns"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
