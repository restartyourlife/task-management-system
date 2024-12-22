export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type SortField = 'title' | 'createdAt' | 'priority' | 'status'
export type SortOrder = 'asc' | 'desc'

export interface TaskFilters {
  search: string
  tags: string[]
  status?: Task['status']
  priority?: Task['priority']
}
