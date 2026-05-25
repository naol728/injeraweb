import apiClient from "./apiClinet";
import { handleApiResponse } from "@/lib/handleApiResponse";

/* -------------------------------------------------------------------------- */
/*                            USER SUBSCRIPTIONS                              */
/* -------------------------------------------------------------------------- */

export interface UserSubscriptionPayload {
  subscription_id: string;
  payment_reference?: string;
  payment_provider?: string;
  amount_paid?: number;
  starts_at?: string;
}

export interface UpdateUserSubscriptionPayload {
  status: "pending" | "active" | "expired" | "cancelled";
}

/**
 * Get user subscriptions
 * - Admin => all subscriptions
 * - Advertiser => own subscriptions
 */
export const getUserSubscriptions = async () => {
  return handleApiResponse(() => apiClient.get("/user-subscriptions"));
};

/**
 * Get single user subscription
 */
export const getUserSubscription = async (id: string) => {
  return handleApiResponse(() => apiClient.get(`/user-subscriptions/${id}`));
};

/**
 * Purchase/Create user subscription
 */
export const createUserSubscription = async (data: UserSubscriptionPayload) => {
  return handleApiResponse(() =>
    apiClient.post("/user-subscriptions", {
      subscription_id: data.subscription_id,
      payment_reference: data.payment_reference,
      payment_provider: data.payment_provider,
      amount_paid: data.amount_paid,
      starts_at: data.starts_at,
    }),
  );
};

/**
 * Update user subscription status
 */
export const updateUserSubscription = async (
  id: string,
  data: UpdateUserSubscriptionPayload,
) => {
  return handleApiResponse(() =>
    apiClient.put(`/user-subscriptions/${id}`, {
      status: data.status,
    }),
  );
};

/**
 * Delete user subscription
 * Admin only
 */
export const deleteUserSubscription = async (id: string) => {
  return handleApiResponse(() => apiClient.delete(`/user-subscriptions/${id}`));
};

/* -------------------------------------------------------------------------- */
/*                              SUBSCRIPTIONS                                 */
/* -------------------------------------------------------------------------- */

export interface SubscriptionPayload {
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  duration_days: number;
  video_upload_limit: number;
  max_video_duration_seconds?: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateSubscriptionPayload {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  currency?: string;
  duration_days?: number;
  video_upload_limit?: number;
  max_video_duration_seconds?: number;
  is_active?: boolean;
  sort_order?: number;
}

/**
 * Get all subscription plans
 */
export const getSubscriptions = async () => {
  return handleApiResponse(() => apiClient.get("/subscriptions"));
};

/**
 * Get single subscription plan
 */
export const getSubscription = async (id: string) => {
  return handleApiResponse(() => apiClient.get(`/subscriptions/${id}`));
};

/**
 * Create subscription plan
 * Admin only
 */
export const createSubscription = async (data: SubscriptionPayload) => {
  return handleApiResponse(() =>
    apiClient.post("/subscriptions", {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      currency: data.currency,
      duration_days: data.duration_days,
      video_upload_limit: data.video_upload_limit,
      max_video_duration_seconds: data.max_video_duration_seconds,
      is_active: data.is_active,
      sort_order: data.sort_order,
    }),
  );
};

/**
 * Update subscription plan
 * Admin only
 */
export const updateSubscription = async (
  id: string,
  data: UpdateSubscriptionPayload,
) => {
  return handleApiResponse(() =>
    apiClient.put(`/subscriptions/${id}`, {
      ...data,
    }),
  );
};

/**
 * Delete subscription plan
 * Admin only
 */
export const deleteSubscription = async (id: string) => {
  return handleApiResponse(() => apiClient.delete(`/subscriptions/${id}`));
};
