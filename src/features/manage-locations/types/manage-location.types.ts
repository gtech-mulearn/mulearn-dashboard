export interface Location {
  label: string;
  value: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    count: number;
    totalPages: number;
    isNext: boolean;
    isPrev: boolean;
    nextPage?: number | null;
  };
}

export interface LocationParams {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
  enabled?: boolean;
}

export type CreateCountryInput = {
  name: string;
  code: string;
  is_active: boolean;
};

export type CreateDistrictInput = {
  name: string;
  code: string;
  is_active: boolean;
};

export type CreateZoneInput = {
  name: string;
  code: string;
  is_active: boolean;
};

export type ApiEnvelope<T> = {
  hasError: boolean;
  statusCode: number;
  message?: string | string[] | Record<string, string[]> | null;
  response: T;
};

export interface LocationData extends PaginatedData<Location> {}
