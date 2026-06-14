"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { extractDjangoMessage } from "@/api/errors";

export function getTaskErrorMessage(error: unknown, fallback: string): string {
  const directMessage = extractDjangoMessage(error);
  if (directMessage) return directMessage;

  if (error instanceof ApiError) {
    const dataMessage = extractDjangoMessage(error.data);
    if (dataMessage) return dataMessage;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

export function useTaskQueryErrorToast(error: unknown, fallback: string): void {
  useEffect(() => {
    if (!error) return;
    toast.error(getTaskErrorMessage(error, fallback));
  }, [error, fallback]);
}
