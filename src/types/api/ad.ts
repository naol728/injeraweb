import type { AdVideo } from "../models/adVideo";

export interface FetchAdsRequest {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
  advertiserId?: string;
  includeInactive?: boolean;
}
export interface Category {
  id: string;
  name: string;
}

export interface Advertiser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  type: "advertiser";
  website_url?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FetchAdsResponse extends PaginationMeta {
  data: AdVideo[];
  has_more: boolean;
  nextPage: number;
}
