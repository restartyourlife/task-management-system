export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          status: 'todo' | 'in-progress' | 'done'
          priority: 'low' | 'medium' | 'high'
          tags: string[]
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: Omit<
          Database['public']['Tables']['tasks']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['comments']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
    }
  }
}
