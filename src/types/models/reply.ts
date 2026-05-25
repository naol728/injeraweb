export interface Reply {
  id: string
  ad_comment_id: string
  reply: string
  created_at: string
  user: {
    id: string
    username: string
    profile_picture?: string
  }
}

export interface ReplyApiResponse {
  success: boolean
  comment_id: string
  reply_count: number
  data: {
    data: Reply[]
    current_page: number
    last_page: number
    next_page_url: string | null
  }
}
