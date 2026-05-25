import apiClinet from "./apiClinet";
import { handleApiResponse } from "./../lib/handleApiResponse";

/* =========================
   TYPES
========================= */

export type WithdrawalStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export interface WithdrawalFilters {
  page?: number;
  size?: number;
}

export interface ReviewWithdrawalPayload {
  status:
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "processing"
    | "paid"
    | "failed"
    | "cancelled";
  review_notes?: string;
}

export interface CompleteWithdrawalPayload {
  processor_reference: string;
  processor_notes?: string;
}

export interface FailWithdrawalPayload {
  processor_notes: string;
}

/* =========================
   PAYMENT PROCESSOR APIs
========================= */

/**
 * Get all withdrawals
 * payment_processor/admin can see all
 */
export const getWithdrawals = async (filters?: WithdrawalFilters) => {
  return handleApiResponse(() =>
    apiClinet.get("/withdrawals", {
      params: {
        page: filters?.page ?? 1,
        size: filters?.size ?? 15,
      },
    }),
  );
};

/**
 * Get single withdrawal detail
 */
export const getWithdrawal = async (withdrawalId: string) => {
  return handleApiResponse(() => apiClinet.get(`/withdrawals/${withdrawalId}`));
};

/**
 * Review withdrawal
 * approve / reject / under_review
 */
export const reviewWithdrawal = async (
  withdrawalId: string,
  data: ReviewWithdrawalPayload,
) => {
  return handleApiResponse(() =>
    apiClinet.post(`/withdrawals/${withdrawalId}/review`, {
      status: data.status,
      review_notes: data.review_notes ?? "",
    }),
  );
};

/**
 * Move approved withdrawal to processing
 */
export const processWithdrawal = async (withdrawalId: string) => {
  return handleApiResponse(() =>
    apiClinet.post(`/withdrawals/${withdrawalId}/process`),
  );
};

/**
 * Mark withdrawal as paid
 */
export const completeWithdrawal = async (
  withdrawalId: string,
  data: CompleteWithdrawalPayload,
) => {
  return handleApiResponse(() =>
    apiClinet.post(`/withdrawals/${withdrawalId}/complete`, {
      processor_reference: data.processor_reference,
      processor_notes: data.processor_notes ?? "",
    }),
  );
};

/**
 * Mark withdrawal as failed
 * and refund wallet
 */
export const failWithdrawal = async (
  withdrawalId: string,
  data: FailWithdrawalPayload,
) => {
  return handleApiResponse(() =>
    apiClinet.post(`/withdrawals/${withdrawalId}/fail`, {
      processor_notes: data.processor_notes,
    }),
  );
};

/**
 * User cancels withdrawal
 */
export const cancelWithdrawal = async (withdrawalId: string) => {
  return handleApiResponse(() =>
    apiClinet.delete(`/withdrawals/${withdrawalId}`),
  );
};

export const getUsersWithdrawalhistory = async () => {
  return handleApiResponse(() => apiClinet.get("/withdrawals/history"));
};
