export type User = {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  type: "admin" | "user" | "advertiser" | "payment_processor";
  website_url?: string;
};
export interface UserType {
  id: string;
  username: string;
  email: string;
  type: "admin" | "user" | "advertiser";
  email_verified_at: string | null;
  created_at: string;
  is_blocking?: boolean; // You might need to add this to your API response
}

export interface UsersResponse {
  success: boolean;
  dashboard: {
    lists: {
      all_users: {
        data: User[];
        current_page: number;
        total: number;
        per_page: number;
        last_page: number;
      };
    };
  };
}
