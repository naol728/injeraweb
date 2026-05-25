// types/comment.ts
export interface Comment {
  id: string
  user: {
    id: string
    username: string
    avatar?: string
  }
  comment: string
  created_at: string
}
// types/pagination.ts
export interface PaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
  next_page_url: string | null
  prev_page_url: string | null
  links: PaginationLink[]
}
// types/api.ts
export interface CommentApiResponse {
  success: boolean
  ad_id: string
  comment_count: number
  data: PaginatedResponse<Comment>
}

