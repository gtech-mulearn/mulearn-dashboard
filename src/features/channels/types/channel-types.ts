export interface ChannelData {
  id: string;
  name: string;
  discord_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
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

export interface ChannelParams {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

export interface ChannelListData extends PaginatedData<ChannelData> {}
