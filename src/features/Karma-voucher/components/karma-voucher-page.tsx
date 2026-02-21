"use client";
import { Ticket, Upload } from "lucide-react";
import { endpoints } from "@/api/endpoints";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useKarmaVoucherLogic } from "../hooks";

export default function KarmaVoucherPage() {
  return (
    <DataTableErrorBoundary>
      <KarmaVoucherContent />
    </DataTableErrorBoundary>
  );
}

function KarmaVoucherContent() {
  const {
    rows,
    isLoading,
    currentPage,
    perPage,
    totalPages,
    totalCount,
    openImport,
    isUploading,
    isImportSuccess,
    importData,
    isExporting,
    isDownloadingTemplate,
    handleNextClick,
    handlePreviousClick,
    handleSearch,
    handlePerPageChange,
    handleSortChange,
    handleDeleteRow,
    handleImportSubmit,
    handleDownloadTemplate,
    toggleImportModal,
    downloadCsv,
  } = useKarmaVoucherLogic();

  return (
    <>
      <Card className="overflow-visible border-0 bg-transparent shadow-none rounded-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1 text-xs font-semibold text-primary">
                <Ticket className="size-3.5" />
                System Management
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Karma Vouchers
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => toggleImportModal(true)}
                className="h-10 rounded-xl"
              >
                <Upload className="mr-2 size-4" />
                Bulk Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 bg-transparent p-0 mt-6">
          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={handlePerPageChange}
            perPage={perPage}
            perPageOptions={[5, 10, 20, 50, 100]}
            CSV={endpoints.admin.karmaVoucher.exportCSV}
            onCsvDownload={downloadCsv}
            isCsvDownloading={isExporting}
            searchPlaceholder="Search by voucher code or user..."
            searchSize="md"
            searchPosition="right"
          />
          <Table
            rows={rows as unknown as Data[]}
            isloading={isLoading}
            page={currentPage}
            perPage={perPage}
            columnOrder={[
              { column: "user", Label: "User", isSortable: true },
              { column: "code", Label: "Voucher Code", isSortable: true },
              { column: "karma", Label: "Karma", isSortable: true },
              { column: "claimed", Label: "Claimed", isSortable: true },
              { column: "task", Label: "Task", isSortable: true },
              { column: "created_by", Label: "Created By", isSortable: true },
              { column: "created_at", Label: "Created On", isSortable: true },
            ]}
            id={["id"]}
            onDeleteClick={handleDeleteRow}
            modalDeleteHeading="Delete Voucher"
            modalTypeContent="error"
            modalDeleteContent="Are you sure you want to delete this karma voucher? This action cannot be undone."
          >
            <THead
              columnOrder={[
                { column: "user", Label: "User", isSortable: true },
                { column: "code", Label: "Voucher Code", isSortable: true },
                { column: "karma", Label: "Karma", isSortable: true },
                { column: "claimed", Label: "Claimed", isSortable: true },
                { column: "task", Label: "Task", isSortable: true },
                { column: "created_by", Label: "Created By", isSortable: true },
                { column: "created_at", Label: "Created On", isSortable: true },
              ]}
              onIconClick={handleSortChange}
              action
            />
            <div>
              {!isLoading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handleNextClick={handleNextClick}
                  handlePreviousClick={handlePreviousClick}
                  perPage={perPage}
                  totalCount={totalCount}
                />
              )}
            </div>
            <Blank />
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openImport} onOpenChange={toggleImportModal}>
        <DialogContent className="rounded-3xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle>Bulk Import Vouchers</DialogTitle>
            <DialogDescription>
              Upload an XLSX file to bulk import karma vouchers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-neutral-700 bg-neutral-900/50">
              <p className="mb-4 text-sm text-neutral-400">
                Upload CSV or XLSX file
              </p>
              <input
                type="file"
                name="file"
                accept=".csv, .xlsx, .xls"
                className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 transition-colors"
                required
              />
            </div>

            {isImportSuccess && importData && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                  <p className="text-sm font-medium text-green-400">
                    Import Summary: {importData.Success.length} Success,{" "}
                    {importData.Failed.length} Failed
                  </p>
                </div>

                {importData.Failed.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-2 p-3 rounded-lg bg-red-900/10 border border-red-800/20">
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                      Errors:
                    </p>
                    {importData.Failed.map((err) => (
                      <div
                        key={`${err.code}-${err.message}`}
                        className="text-xs text-red-400 flex gap-2"
                      >
                        <span className="font-mono text-neutral-500">
                          [{err.code}]
                        </span>
                        <span>{err.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className="text-xs"
              >
                Download Template
              </Button>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => toggleImportModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Importing..." : "Upload File"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
