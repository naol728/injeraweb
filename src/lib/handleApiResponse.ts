import { AxiosError, type AxiosResponse } from "axios";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Handles an API call globally.
 * You pass a function that performs the actual API request.
 * It automatically returns the data or throws a clean error message.
 */
export async function handleApiResponse<T>(
  apiCall: () => Promise<AxiosResponse<T>>
): Promise<T> {
  try {
    const response = await apiCall();
    if (!response?.data) throw new Error("Empty response from server.");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const serverMessage =
        axiosError.response?.data?.message ??
        Object.values(axiosError.response?.data?.errors || {})[0]?.[0] ??
        "An unknown error occurred.";
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
      throw new Error(serverMessage);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Unexpected error occurred.");
  }
}
