import { handleApiResponse } from "@/lib/handleApiResponse";
import apiClinet from "./apiClinet";

export const getAnalyticsAdvertiser = async () => {
  return handleApiResponse(() =>
    apiClinet.get("/analytics/adertiser-analysis"),
  );
};
