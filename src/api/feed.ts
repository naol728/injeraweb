import { handleApiResponse } from "@/lib/handleApiResponse";
import apiClient from "./apiClinet";

import type { FetchAdsResponse } from "@/types/api/ad";

export const postAdFeed = async (data: FormData) => {
  return handleApiResponse(() =>
    apiClient.post("/ads/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};

export const fetchAdFeed = async ({ cursor }: { cursor: string }) => {
  return handleApiResponse<FetchAdsResponse>(() =>
    apiClient.get("/ads/feed", {
      params: {
        cursor: cursor,
      },
    })
  );
};

export const addVidoeFinshed = async (videoid: string) => {
  return handleApiResponse(() =>
    apiClient.post(`/ads/${videoid}/view`, {
      watched_percentage: "100",
    })
  );
};
export const fetchUserPoints = async () => {
  return handleApiResponse<{ points: number }>(() =>
    apiClient.get("/user/points")
  );
};
export const fetchAdcomment = async ({
  adid,
  page = 1,
}: {
  adid: string;
  page: number;
}) => {
  return handleApiResponse(() =>
    apiClient.get(`/ads/${adid}/comments?page=${page}`)
  );
};
export const fetchAdcommentreply = async ({
  adid,
  commentId,
  page = 1,
}: {
  adid: string;
  commentId: string;
  page?: number;
}) => {
  return handleApiResponse(() =>
    apiClient.get(`/ads/${adid}/comments/${commentId}/replies?page=${page}`)
  );
};

export const postComment = async ({
  comment,
  videoid,
}: {
  comment: string;
  videoid: string;
}) => {
  return handleApiResponse(() =>
    apiClient.post(`/ads/${videoid}/comment`, {
      comment,
    })
  );
};
export const replytoComment = async ({
  reply,
  videoid,
  commentid,
}: {
  reply: string;
  videoid: string;
  commentid: string;
}) => {
  return handleApiResponse(() =>
    apiClient.post(`/ads/${videoid}/comments/${commentid}/reply`, {
      reply,
    })
  );
};
