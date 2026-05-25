import type { User } from "../models/user";

export interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
  type: "user" | "advertiser";
}
export interface RegistrationResponse {
  message: string;
  requires_verification: boolean;
  user: User;
}

export interface VarifyEmailRequest {
  email: string;
  otp: string;
}

export interface VarifyEmailResponse {
  message: string;
  user: User;
  token: string;
}
export interface LoginRequest {
  login: string;
  password: string;
}
export interface LoginResponse {
  user: User;
  message: string;
  token: string;
}
export interface RegisterErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
export interface ResetPasswordParam {
  password: string;
  password_confirmation: string;
  otp: string;
  email: string;
}
