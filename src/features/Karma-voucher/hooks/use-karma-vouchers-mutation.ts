import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
//import { downloadBlob } from "@/lib/download";
import {
  deleteKarmaVoucher,
  //exportVouchersCSV,
  importVouchers,
  //downloadTemplate,
} from "../api";

export function useDeleteKarmaVoucher() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteKarmaVoucher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["karma-vouchers"] });
      toast.success("Voucher deleted");
    },
    onError: () => toast.error("Delete failed"),
  });
}

/*export function useExportVouchersCSV() {
  return useMutation({
    mutationFn: exportVouchersCSV,
    onSuccess: (blob) => {
      downloadBlob(blob, "karma-vouchers.csv")
      toast.success("Export successful")
    },
  })
}*/

export function useImportVouchers() {
  return useMutation({
    mutationFn: importVouchers,
  });
}

/*export function useDownloadTemplate() {
  return useMutation({
    mutationFn: downloadTemplate,
    onSuccess: (blob) => {
      downloadBlob(blob, "karma-voucher-template.xlsx")
    },
  })
}*/
