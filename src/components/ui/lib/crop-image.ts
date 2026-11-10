export interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Start near-lossless and only step down if the encoded result blows the size
// budget. Event posters carry small text, which is the first thing low-quality
// JPEG smears, so the top step matters.
const QUALITY_STEPS = [0.95, 0.85, 0.75, 0.6] as const;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

/** Pixel slack allowed when deciding a crop kept the whole frame. */
const FULL_FRAME_TOLERANCE_RATIO = 0.01;

/**
 * True when `cropPixels` covers essentially all of a `naturalWidth` x
 * `naturalHeight` image and that image needs no downscaling to fit
 * `outputMaxDimension` — i.e. re-encoding would only throw away detail.
 */
export function isLosslessPassThrough(
  cropPixels: CropPixels,
  naturalWidth: number,
  naturalHeight: number,
  outputMaxDimension: number,
): boolean {
  if (naturalWidth <= 0 || naturalHeight <= 0) return false;
  if (Math.max(naturalWidth, naturalHeight) > outputMaxDimension) return false;

  const toleranceX = Math.max(2, naturalWidth * FULL_FRAME_TOLERANCE_RATIO);
  const toleranceY = Math.max(2, naturalHeight * FULL_FRAME_TOLERANCE_RATIO);

  return (
    cropPixels.x <= toleranceX &&
    cropPixels.y <= toleranceY &&
    cropPixels.width >= naturalWidth - toleranceX * 2 &&
    cropPixels.height >= naturalHeight - toleranceY * 2
  );
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
  quality = 0.95,
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
