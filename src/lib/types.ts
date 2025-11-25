export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived'
export type TaskStatus = 'pending' | 'in-progress' | 'in-review' | 'completed' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type UserRole = 'admin' | 'project-manager' | 'team-member'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: number
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  priority: TaskPriority
  startDate: number
  endDate: number
  projectManager: string
  teamMembers: string[]
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: string
  dueDate?: number
  createdAt: number
  updatedAt: number
  createdBy: string
  completedAt?: number
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: number
}

export interface Activity {
  id: string
  projectId: string
  userId: string
  type: 'project_created' | 'project_updated' | 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'member_added'
  description: string
  timestamp: number
}
