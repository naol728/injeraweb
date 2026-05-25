import apiClient from "./apiClinet";
import { handleApiResponse } from "@/lib/handleApiResponse";

export const fetchusers = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  console.log(page, limit);
  return handleApiResponse(() => apiClient.get(`/admin/dashboard`));
};
export const blockUser = ({ userid }: { userid: string }) => {
  return handleApiResponse(() => apiClient.get(`/block-user/${userid}`));
};
export const unblockUser = ({ userid }: { userid: string }) => {
  return handleApiResponse(() => apiClient.get(`/unblock-user/${userid}`));
};
const analyticsEndpoints = {
  overview: "/analytics/overview",
  topEndpoints: "/analytics/top-endpoints",
  topEndpointsMethod: "/analytics/top-endpoints-method",
  traffic: "/analytics/traffic",
  avgResponse: "/analytics/avg-response",
  errors: "/analytics/errors",
  slowEndpoints: "/analytics/slow-endpoints",
};

export const fetchAnalytics = (key: keyof typeof analyticsEndpoints) => {
  return handleApiResponse(() => apiClient.get(analyticsEndpoints[key]));
};
export const assignrole = async (data: { userId: string; role: string }) => {
  const { userId, role } = data;
  return handleApiResponse(() =>
    apiClient.post(`/assign-role/${userId}`, { role }),
  );
};
export const createPaymentProcessor = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const { username, email, password } = data;
  return handleApiResponse(() =>
    apiClient.post("/payment-processors", { username, email, password }),
  );
};

export const SystemBalance = () => {
  return handleApiResponse(() => apiClient.get("/system/balance"));
};

export const PaymnetProcessorslist = () => {
  return handleApiResponse(() => apiClient.get("/payment-processors"));
};
export const DeletePaymnetProcessor = (processorId: string) => {
  return handleApiResponse(() =>
    apiClient.delete(`/payment-processors/${processorId}`),
  );
};
export const updatePaymnetProcessor = (
  processorId: string,
  data: {
    username: string;
    email: string;
  },
) => {
  return handleApiResponse(() =>
    apiClient.put(`/payment-processors/${processorId}`, data),
  );
};
