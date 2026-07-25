/**
 * Interest Group cover/icon image upload constants.
 *
 * 📍 src/features/manage-ig/constants/ig-images.constants.ts
 *
 * The 5 MB cap matches the backend's documented limit for
 * `POST /ig/{pk}/cover-image/`, `/icon-image/`, and the inline
 * `cover_image`/`icon_image` fields on Create/Request — see
 * docs/ig-cover-icon-image-plan.md.
 */

export const IG_IMAGE_MAX_MB = 5;

/** Wide banner crop for the IG cover image. */
export const IG_COVER_IMAGE_ASPECT = 16 / 9;

/** Square crop for the IG icon image. */
export const IG_ICON_IMAGE_ASPECT = 1;
