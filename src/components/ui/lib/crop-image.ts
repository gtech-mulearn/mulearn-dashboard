export interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

const QUALITY_STEPS = [0.85, 0.7, 0.5] as const;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

/**
 * Draws the given pixel region of `imageSrc` onto an offscreen canvas,
 * scaled so its longest edge is at most `outputMaxDimension`, and encodes
 * it as a JPEG blob.
 */
export async function cropImageToBlob(
  imageSrc: string,
  cropPixels: CropPixels,
  outputMaxDimension = 1600,
  quality = 0.85,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const scale = Math.min(
    1,
    outputMaxDimension / Math.max(cropPixels.width, cropPixels.height),
  );
  const outputWidth = Math.round(cropPixels.width * scale);
  const outputHeight = Math.round(cropPixels.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob returned null"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Crops and encodes at decreasing JPEG quality until the result fits
 * `maxSizeBytes`. Throws if it still doesn't fit after the lowest step.
 */
export async function cropImageToBlobWithinSizeLimit(
  imageSrc: string,
  cropPixels: CropPixels,
  outputMaxDimension: number,
  maxSizeBytes: number,
): Promise<Blob> {
  let lastBlob: Blob | null = null;
  for (const quality of QUALITY_STEPS) {
    lastBlob = await cropImageToBlob(
      imageSrc,
      cropPixels,
      outputMaxDimension,
      quality,
    );
    if (lastBlob.size <= maxSizeBytes) {
      return lastBlob;
    }
  }
  const finalMB = ((lastBlob as Blob).size / (1024 * 1024)).toFixed(1);
  const limitMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
  throw new Error(
    `Cropped image is ${finalMB}MB after compression, which exceeds the ${limitMB}MB limit. Try zooming out or picking a smaller image.`,
  );
}
