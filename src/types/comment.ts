export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  author: {
    full_name: string | null
    avatar_url: string
  }
}
