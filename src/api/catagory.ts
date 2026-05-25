import { handleApiResponse } from "@/lib/handleApiResponse";
import apiClinet from "./apiClinet";
interface Catagories {
  id: string;
  name: string;
}
export const getCatagory = async () => {
  return handleApiResponse<Catagories[]>(() => apiClinet.get("/categories"));
};
