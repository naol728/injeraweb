import { handleApiResponse } from "@/lib/handleApiResponse";
import apiClinet from "./apiClinet";

export const fetchuserprofile = async () => {
  return handleApiResponse(() => apiClinet.get("/profile/user"));
};
export const fetchAdvertiserProfile = async ({ id }: { id: string }) => {
  return handleApiResponse(() => apiClinet.get(`/advertiser/public/${id}`));
};

// api/profile.ts - Update convertObjectToFormData function
const convertObjectToFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      // Handle arrays (like favorite_categories)
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, item);
      });
    } else if (value !== null && value !== undefined) {
      // Convert booleans to '1'/'0' for Laravel
      if (typeof value === "boolean") {
        formData.append(key, value ? "1" : "0");
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
};

// Update the main updateUserProfile function to handle files
export const updateUserProfile = async (data: Record<string, any>) => {
  // Check if there's a file to upload
  const hasFile = Object.values(data).some((value) => value instanceof File);

  if (hasFile) {
    // Use FormData for file uploads
    return handleApiResponse(() =>
      apiClinet.post("/profile/user", convertObjectToFormData(data), {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
  } else {
    // Use regular JSON for non-file updates
    // Remove null/undefined values and empty strings
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
    );

    // Convert boolean values from strings to actual booleans if needed
    const processedData = Object.fromEntries(
      Object.entries(cleanData).map(([key, value]) => {
        // Handle boolean fields
        if (
          [
            "notifications_enabled",
            "email_notifications",
            "is_active",
          ].includes(key)
        ) {
          if (value === "true" || value === true) return [key, true];
          if (value === "false" || value === false) return [key, false];
        }

        // Handle numeric fields - convert strings to numbers
        if (
          [
            "points_balance",
            "money_balance",
            "total_earned",
            "total_ads_watched",
            "total_games_played",
            "total_comments",
            "total_shares",
          ].includes(key)
        ) {
          const num = parseFloat(value as string);
          return [key, isNaN(num) ? 0 : num];
        }

        return [key, value];
      })
    );

    console.log("Sending update payload:", processedData);

    return handleApiResponse(() =>
      apiClinet.post("/profile/user", processedData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  }
};

// Optional: Keep the separate file upload function if needed
export const updateUserProfileWithFile = async (formData: FormData) => {
  console.log("Sending FormData for profile picture update");

  return handleApiResponse(() =>
    apiClinet.post("/profile/user", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};
export const fetchadvertiserownprofile = async () => {
  return handleApiResponse(() => apiClinet.get(`/profile/advertiser`));
};
// types/profile.ts
export interface AdvertiserProfileUpdateData {
  // Personal Information
  username?: string;
  email?: string;
  phone_number?: string;

  // Business Information
  company_name?: string;
  business_email?: string;
  description?: string;

  // Location
  country?: string;
  city?: string;
  address?: string;
  website?: string;

  // Media
  logo?: string;
  profile_picture?: string;
  cover_image?: string;

  // Social Media
  social_media_links?: Array<{
    platform: string;
    url: string;
  }>;

  // Preferences
  notifications_enabled?: boolean;
  email_notifications?: boolean;

  // Security (if needed)
  is_active?: boolean;
}
export const updateadveriserprofile = async ({ data }: { data: FormData }) => {
  return handleApiResponse(() =>
    apiClinet.post("/profile/advertiser", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};
