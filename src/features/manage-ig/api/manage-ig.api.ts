import { ApiError, apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { IG_IMAGE_MAX_MB } from "../constants/ig-images.constants";
import type {
  InterestGroup,
  InterestGroupCreate,
  InterestGroupListResponse,
  InterestGroupRequestListResponse,
  InterestGroupUpdate,
} from "../schemas";
import {
  IgCoverImageResponseSchema,
  IgIconImageResponseSchema,
  InterestGroupCreateResponseSchema,
  InterestGroupListResponseSchema,
  InterestGroupRequestListResponseSchema,
} from "../schemas";

const IG_IMAGE_MAX_BYTES = IG_IMAGE_MAX_MB * 1024 * 1024;

function assertValidIgImage(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new ApiError(400, "Expected an image file");
  }
  if (file.size > IG_IMAGE_MAX_BYTES) {
    throw new ApiError(400, `Image must be under ${IG_IMAGE_MAX_MB} MB`);
  }
}

/** Optional images that can be attached inline to Create/Request. */
type IgImagesInput = {
  coverImage?: File | null;
  iconImage?: File | null;
};

/**
 * Builds the multipart body for Create/Request when images are attached.
 * Array/object fields (leads, mentors, prerequisites, ...) are JSON-encoded
 * since multipart form values are otherwise plain strings.
 */
function buildIgFormData(
  data: Record<string, unknown>,
  images: IgImagesInput,
): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(
      key,
      typeof value === "object" ? JSON.stringify(value) : String(value),
    );
  });
  if (images.coverImage) fd.append("cover_image", images.coverImage);
  if (images.iconImage) fd.append("icon_image", images.iconImage);
  return fd;
}

export async function getAdminInterestGroups(params: {
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}): Promise<InterestGroupListResponse> {
  const query = new URLSearchParams();
  if (params.pageIndex) query.append("pageIndex", params.pageIndex.toString());
  if (params.perPage) query.append("perPage", params.perPage.toString());
  if (params.search) query.append("search", params.search);
  if (params.sortBy) query.append("sortBy", params.sortBy);

  const response = await apiClient.get(
    `${endpoints.admin.interestGroups.list}?${query.toString()}`,
    InterestGroupListResponseSchema,
  );
  return response.response;
}

export async function createInterestGroup(
  data: InterestGroupCreate,
  images?: IgImagesInput,
): Promise<InterestGroup> {
  const coverImage = images?.coverImage ?? null;
  const iconImage = images?.iconImage ?? null;
  if (coverImage) assertValidIgImage(coverImage);
  if (iconImage) assertValidIgImage(iconImage);

  const response = await (coverImage || iconImage
    ? apiClient.post(
        endpoints.admin.interestGroups.create,
        buildIgFormData(data, { coverImage, iconImage }),
        InterestGroupCreateResponseSchema,
        { isFormData: true },
      )
    : apiClient.post(
        endpoints.admin.interestGroups.create,
        data,
        InterestGroupCreateResponseSchema,
      ));
  return response.response.interestGroup;
}

export async function updateInterestGroup(
  id: string,
  data: InterestGroupUpdate,
): Promise<void> {
  return apiClient.put(endpoints.admin.interestGroups.edit(id), data);
}

export async function partialUpdateInterestGroup(
  id: string,
  data: Partial<InterestGroupUpdate>,
): Promise<void> {
  return apiClient.patch(
    endpoints.admin.interestGroups.partialUpdate(id),
    data,
  );
}

export async function deleteInterestGroup(id: string): Promise<void> {
  return apiClient.delete(endpoints.admin.interestGroups.delete(id));
}

export async function exportIgCSV(): Promise<Blob> {
  return apiClient.get(endpoints.admin.interestGroups.csv, undefined, {
    responseType: "blob",
  });
}

export async function getIgRequests(params: {
  user_id?: string;
  status?: string;
  perPage?: number;
  pageIndex?: number;
  search?: string;
  sortBy?: string;
}): Promise<InterestGroupRequestListResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.append(key, value.toString());
  });

  const response = await apiClient.get(
    `${endpoints.admin.interestGroups.requestList}?${query.toString()}`,
    InterestGroupRequestListResponseSchema,
  );
  return response.response;
}

export async function updateIgRequestStatus(
  id: string,
  status: "active" | "requested" | "cancelled" | "rejected",
): Promise<void> {
  return apiClient.patch(endpoints.admin.interestGroups.requestUpdate(id), {
    status,
  });
}

export async function submitIgRequest(
  data: {
    name: string;
    code: string;
    category: string;
  },
  images?: IgImagesInput,
): Promise<void> {
  const coverImage = images?.coverImage ?? null;
  const iconImage = images?.iconImage ?? null;
  if (coverImage) assertValidIgImage(coverImage);
  if (iconImage) assertValidIgImage(iconImage);

  if (coverImage || iconImage) {
    return apiClient.post(
      endpoints.admin.interestGroups.requestSubmit,
      buildIgFormData(data, { coverImage, iconImage }),
      undefined,
      { isFormData: true },
    );
  }
  return apiClient.post(endpoints.admin.interestGroups.requestSubmit, data);
}

// ============================================
// Cover / icon image — standalone upload & remove
// (for editing an IG that already exists; create-time upload is one-shot,
// see createInterestGroup/submitIgRequest above)
// ============================================

export async function uploadIgCoverImage(
  igId: string,
  file: File,
): Promise<string | null> {
  assertValidIgImage(file);
  const fd = new FormData();
  fd.append("image", file);
  const response = await apiClient.post(
    endpoints.admin.interestGroups.coverImage(igId),
    fd,
    IgCoverImageResponseSchema,
    { isFormData: true },
  );
  return response.response.cover_image;
}

export async function removeIgCoverImage(igId: string): Promise<void> {
  await apiClient.delete(endpoints.admin.interestGroups.coverImage(igId));
}

export async function uploadIgIconImage(
  igId: string,
  file: File,
): Promise<string | null> {
  assertValidIgImage(file);
  const fd = new FormData();
  fd.append("image", file);
  const response = await apiClient.post(
    endpoints.admin.interestGroups.iconImage(igId),
    fd,
    IgIconImageResponseSchema,
    { isFormData: true },
  );
  return response.response.icon_image;
}

export async function removeIgIconImage(igId: string): Promise<void> {
  await apiClient.delete(endpoints.admin.interestGroups.iconImage(igId));
}
