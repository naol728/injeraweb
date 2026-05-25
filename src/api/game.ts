import { handleApiResponse } from "@/lib/handleApiResponse";
import apiClinet from "./apiClinet";

export const getAllgames = async () => {
  return handleApiResponse(() => apiClinet.get("/all-games"));
};

export const spinWheel = async ({ game_id }: { game_id: string }) => {
  return handleApiResponse(() =>
    apiClinet.post("/spin-wheel/spin", { game_id }),
  );
};
