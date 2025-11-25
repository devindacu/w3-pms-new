import { type Project, type Task, type ProjectStatus, type TaskStatus } from './types'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.status === 'completed').length
  return Math.round((completed / tasks.length) * 100)
}

export function getProjectStatusColor(status: ProjectStatus): string {
  const colors = {
    planning: 'bg-muted text-muted-foreground',
    active: 'bg-primary text-primary-foreground',
    'on-hold': 'bg-accent text-accent-foreground',
    completed: 'bg-success text-success-foreground',
    archived: 'bg-secondary text-secondary-foreground'
  }
  return colors[status]
}

export function getTaskStatusColor(status: TaskStatus): string {
  const colors = {
    pending: 'bg-muted text-muted-foreground',
    'in-progress': 'bg-primary text-primary-foreground',
    'in-review': 'bg-accent text-accent-foreground',
    completed: 'bg-success text-success-foreground',
    blocked: 'bg-destructive text-destructive-foreground'
  }
  return colors[status]
}

export function getPriorityColor(priority: string): string {
  const colors = {
    low: 'text-muted-foreground',
    medium: 'text-primary',
    high: 'text-accent',
    urgent: 'text-destructive'
  }
  return colors[priority as keyof typeof colors] || colors.medium
}

export function isOverdue(dueDate: number | undefined): boolean {
  if (!dueDate) return false
  return Date.now() > dueDate
}

export function getDaysUntilDue(dueDate: number | undefined): number | null {
  if (!dueDate) return null
  const diff = dueDate - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function filterProjects(projects: Project[], searchTerm: string): Project[] {
  const term = searchTerm.toLowerCase()
  return projects.filter(p => 
    p.name.toLowerCase().includes(term) ||
    p.description.toLowerCase().includes(term)
  )
}

export function sortProjects(projects: Project[], sortBy: 'name' | 'date' | 'status'): Project[] {
  return [...projects].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'date') return b.createdAt - a.createdAt
    return a.status.localeCompare(b.status)
  })
}
