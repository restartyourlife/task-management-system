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
    }
  }
}
