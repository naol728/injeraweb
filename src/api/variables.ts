import { handleApiResponse } from "@/lib/handleApiResponse";
import apiClient from "./apiClinet";

// =======================
// VARIABLES (existing)
// =======================

// Get all variables
export const fetchVariables = () => {
  return handleApiResponse(() => apiClient.get(`/variables`));
};

// Get single variable
export const fetchVariableById = (id: string) => {
  return handleApiResponse(() => apiClient.get(`/variables/${id}`));
};

// Update variable
export const updateVariable = ({
  id,
  data,
}: {
  id: string;
  data: {
    point: string;
    type?: "earn_point" | "bet_point";
    value: number;
  };
}) => {
  return handleApiResponse(() => apiClient.put(`/variables/${id}`, data));
};

// =======================
// REWARDS (new)
// =======================

// Get all rewards
export const fetchRewards = () => {
  return handleApiResponse(() => apiClient.get(`/reward`));
};

// Get single reward
export const fetchRewardById = (id: string) => {
  return handleApiResponse(() => apiClient.get(`/reward/${id}`));
};

// Update reward
export const updateReward = ({
  id,
  data,
}: {
  id: string;
  data: {
    name?: string;
    description?: string;
    icon?: string;
    probability?: number;
    type?: string;
    value?: number;
    is_active?: boolean;
  };
}) => {
  return handleApiResponse(() => apiClient.put(`/reward/${id}`, data));
};
