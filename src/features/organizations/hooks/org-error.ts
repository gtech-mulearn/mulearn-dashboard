"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";

export function useOrgQueryErrorToast(error: unknown, fallback: string): void {
  useEffect(() => {
    if (!error) return;
    toast.error(getApiResponseError(error, { fallback }));
  }, [error, fallback]);
}
