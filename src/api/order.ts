import { handleApiResponse } from "@/lib/handleApiResponse";
import apiClient from "./apiClinet";

export const createOrder = async (data: {
  video_id: string;
  quantity: string;
}) => {
  const { video_id, quantity } = data;
  return handleApiResponse(() =>
    apiClient.post("/orders/orders", { video_id, quantity }),
  );
};
export const getOrders = async () => {
  return handleApiResponse(() => apiClient.get("/orders/orders"));
};
