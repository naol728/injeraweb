import { handleApiResponse } from "@/lib/handleApiResponse";
import apiClient from "./apiClinet";

export const getWalletBalance = async () => {
  return handleApiResponse(() => apiClient.get("/wallet/balance"));
};

export const debgTransation = async (tx_ref: string) => {
  return handleApiResponse(() => apiClient.get(`/debug-transaction/${tx_ref}`));
};
export const processPaymentManualy = async (data: { tx_ref: string }) => {
  const { tx_ref } = data;
  return handleApiResponse(() =>
    apiClient.post("/process-payment-manually", { tx_ref }),
  );
};
export const deposit = async (data: {
  amount: number;
  first_name: string;
  last_name: string;
  phone: string;
}) => {
  const { amount, first_name, last_name, phone } = data;
  return handleApiResponse(() =>
    apiClient.post("/deposit", { amount, first_name, last_name, phone }),
  );
};
export type WithdrawalMethod =
  | "telebirr"
  | "mpesa"
  | "cbe_wallet"
  | "cbe"
  | "awash_bank"
  | "dashen_bank"
  | "boa";

export interface WithdrawalRequestPayload {
  amount: number;
  withdrawal_method: WithdrawalMethod;
  account_number: string;
  account_name: string;
  currency?: string;
  metadata?: Record<string, any>;
}
export const Withdrawalrequest = async (data: WithdrawalRequestPayload) => {
  return handleApiResponse(() =>
    apiClient.post("/withdrawals", {
      amount: data.amount,
      withdrawal_method: data.withdrawal_method,
      account_number: data.account_number,
      account_name: data.account_name,
      currency: data.currency ?? "ETB",
      metadata: data.metadata ?? {},
    }),
  );
};

export const getAdvertiserTransaction = async () => {
  return handleApiResponse(() => apiClient.get("/advertiser/deposits-history"));
};
