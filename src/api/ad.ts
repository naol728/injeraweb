import { handleApiResponse } from "@/lib/handleApiResponse";
import apiClient from "./apiClinet";

export const fetchownad = async () => {
  return handleApiResponse(() => apiClient.get("/owen-videos"));
};
export const fetchownaddetail = async ({ id }: { id: string }) => {
  return handleApiResponse(() => apiClient.get(`/advertiser/video/${id}`));
};
