export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
  userMetadata?: {
    fullName: string
    avatarUrl: string
  }
}
