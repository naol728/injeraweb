import type {
  LoginRequest,
  LoginResponse,
  RegistrationRequest,
  RegistrationResponse,
  ResetPasswordParam,
  VarifyEmailRequest,
  VarifyEmailResponse,
} from "@/types";
import apiClient from "./apiClinet";
import { handleApiResponse } from "@/lib/handleApiResponse";
export const registerUser = async (payload: RegistrationRequest) => {
  return handleApiResponse<RegistrationResponse>(() =>
    apiClient.post("/register", payload)
  );
};
export const varifyEmail = async (payload: VarifyEmailRequest) => {
  return handleApiResponse<VarifyEmailResponse>(() =>
    apiClient.post("/verify-email", payload)
  );
};
export const login = async (payload: LoginRequest) => {
  return handleApiResponse<LoginResponse>(() =>
    apiClient.post("/login", payload)
  );
};
export const forgotPassword = async (payload: { email: string }) => {
  return handleApiResponse(() => apiClient.post("/forgot-password", payload));
};
export const resetPassword = async (payload: ResetPasswordParam) => {
  return handleApiResponse(() => apiClient.post("/reset-password", payload));
};
export const me = async () => {
  return handleApiResponse(() => apiClient.get("/me"));
};
