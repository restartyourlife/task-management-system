export interface Workspace {
  id: string
  name: string
  description: string
  created_at: Date
  owner_id: string
}

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  created_at: Date
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  workspace_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export type SortField = 'title' | 'createdAt' | 'priority' | 'status'
export type SortOrder = 'asc' | 'desc'

export interface TaskFilters {
  search: string
  tags: string[]
  status: Task['status'] | null
  priority: Task['priority'] | null
}
