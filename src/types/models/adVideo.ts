import type { User } from "./user";

export type Category = {
  id: string;
  name: string;
};
export type Pivot = {
  video_id: string;
  tag_id: string;
};
export type Tags = {
  idd: string;
  name: string;
  pivot: Pivot;
};
export type Comment = {
  id: string;
  user: User;
  ad_id: string;
  comment: string;
  created_at: string;
  replies: Comment[] | [];
};

export type AdVideo = {
  id: string;
  advertiser: User;
  title: string;
  description: string;
  created_at: string;
  duration: number;
  video_url: string;
  view_count: number;
  comment_count: number;
  category: Category;
  tags: Tags[];
  is_active: boolean;
};


