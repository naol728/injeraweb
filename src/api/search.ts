import apiClient from "./apiClinet";
import { handleApiResponse } from "./../lib/handleApiResponse";
import type { FetchAdsResponse } from "@/types/api/ad";

export const fetchsearchpagead = () => {
  return handleApiResponse<FetchAdsResponse>(() =>
    apiClient.get("/ads/feed", {
      params: {
        page: 1,
        limit: 6,
      },
    })
  );
};
export const searchAd = ({ term }: { term: string }) => {
  return handleApiResponse(() =>
    apiClient.get(`/seach-video/${term}`)
  );
};
