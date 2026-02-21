"use client";

import { FileText, Upload, X } from "lucide-react";
import * as React from "react";

interface FileUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function FileUpload({
  value,
  onChange,
  accept = ".csv",
  maxSizeMB = 10,
  disabled = false,
  placeholder = "Drop file here or click to browse",
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) return;
    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2" data-testid="file-upload">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
        data-testid="file-upload-input"
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-sm font-medium">
            {value.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {(value.size / 1024).toFixed(1)} KB
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-sm text-muted-foreground opacity-70 hover:opacity-100"
              data-testid="file-upload-remove"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          tabIndex={0}
          className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!disabled) inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          data-testid="file-upload-dropzone"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{placeholder}</p>
          <p className="text-xs text-muted-foreground/70">
            Max {maxSizeMB}MB · {accept}
          </p>
        </button>
      )}
    </div>
  );
}
