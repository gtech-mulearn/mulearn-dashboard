"use client";

import { useCallback, useState } from "react";
import Cropper, {
  type Area,
  type MediaSize,
  type Point,
} from "react-easy-crop";
import { toast } from "sonner";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { cropImageToBlobWithinSizeLimit } from "./lib/crop-image";

export interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  aspect: number;
  cropShape?: "rect" | "round";
  outputMaxDimension?: number;
  outputMaxSizeMB?: number;
  previewAspect?: number;
  onCropComplete: (file: File) => void;
  onCancel: () => void;
}

export function ImageCropDialog({
  open,
  imageSrc,
  aspect,
  cropShape = "rect",
  outputMaxDimension = 1600,
  outputMaxSizeMB = 5,
  previewAspect,
  onCropComplete,
  onCancel,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const blob = await cropImageToBlobWithinSizeLimit(
        imageSrc,
        croppedAreaPixels,
        outputMaxDimension,
        outputMaxSizeMB * 1024 * 1024,
      );
      onCropComplete(
        new File([blob], "cropped-image.jpg", { type: "image/jpeg" }),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to crop image");
    } finally {
      setIsSaving(false);
    }
  };

  const previewObjectPosition =
    previewAspect && croppedAreaPixels && mediaSize
      ? `${((croppedAreaPixels.x + croppedAreaPixels.width / 2) / mediaSize.naturalWidth) * 100}% ${((croppedAreaPixels.y + croppedAreaPixels.height / 2) / mediaSize.naturalHeight) * 100}%`
      : "50% 50%";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reposition image</DialogTitle>
        </DialogHeader>

        <div className="relative mx-auto h-64 w-full max-w-[480px] overflow-hidden rounded-lg bg-muted sm:h-80">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            minZoom={1}
            maxZoom={3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            onMediaLoaded={setMediaSize}
          />
        </div>

        <div className="flex items-center gap-3 px-1">
          <span className="w-10 shrink-0 text-xs text-muted-foreground">
            Zoom
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="w-full accent-primary"
          />
        </div>

        {previewAspect ? (
          <div className="flex items-center gap-2 px-1">
            <span className="shrink-0 text-xs text-muted-foreground">
              Mobile preview
            </span>
            <div
              className="overflow-hidden rounded border bg-cover"
              style={{
                width: 96,
                aspectRatio: previewAspect,
                backgroundImage: `url(${imageSrc})`,
                backgroundPosition: previewObjectPosition,
              }}
              data-testid="mobile-preview"
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !croppedAreaPixels}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
