"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "./button";

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  currentUrl?: string | null;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  currentUrl,
  maxSizeMB = 5,
  disabled = false,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    currentUrl ?? null,
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(currentUrl ?? null);
    }
  }, [value, currentUrl]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(
        "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
      );
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
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

  const handleRemove = () => {
    onChange(null);
    setPreviewUrl(currentUrl ?? null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2" data-testid="image-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
        aria-label="Upload image"
        data-testid="image-upload-input"
      />

      {previewUrl ? (
        <div className="group relative h-32 w-32 overflow-hidden rounded-lg border bg-muted">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                data-testid="image-upload-change"
              >
                Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                aria-label="Remove image"
                data-testid="image-upload-remove"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          tabIndex={0}
          className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${
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
          data-testid="image-upload-dropzone"
        >
          <div className="flex flex-col items-center gap-1 text-center">
            {isDragging ? (
              <Upload className="h-8 w-8 text-primary" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              Drop image here or{" "}
              <span className="font-medium text-primary">click to browse</span>
            </p>
            <p className="text-xs text-muted-foreground/70">
              Max {maxSizeMB}MB · PNG, JPG, GIF, WebP
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
