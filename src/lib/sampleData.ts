import { type Project, type Task } from './types'

export const sampleProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design and improved UX',
    status: 'active',
    priority: 'high',
    startDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 45 * 24 * 60 * 60 * 1000,
    projectManager: 'Sarah Johnson',
    teamMembers: ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Kumar'],
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    createdBy: 'admin'
  },
  {
    id: 'proj-2',
    name: 'Mobile App Development',
    description: 'Native iOS and Android app for customer engagement',
    status: 'active',
    priority: 'urgent',
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
    projectManager: 'David Park',
    teamMembers: ['David Park', 'Lisa Wang', 'James Miller'],
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    createdBy: 'admin'
  },
  {
    id: 'proj-3',
    name: 'Database Migration',
    description: 'Migrate legacy database to modern cloud infrastructure',
    status: 'planning',
    priority: 'medium',
    startDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    projectManager: 'Rachel Green',
    teamMembers: ['Rachel Green', 'Tom Wilson'],
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    createdBy: 'admin'
  }
]

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Design Homepage Mockup',
    description: 'Create high-fidelity mockup for new homepage layout',
    status: 'completed',
    priority: 'high',
    assignee: 'Emily Davis',
    dueDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdBy: 'sarah-johnson',
    completedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Implement Responsive Navigation',
    description: 'Build mobile-friendly navigation component with hamburger menu',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Mike Chen',
    dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    createdBy: 'sarah-johnson'
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Setup CI/CD Pipeline',
    description: 'Configure automated deployment pipeline for staging and production',
    status: 'pending',
    priority: 'medium',
    assignee: 'Alex Kumar',
    dueDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    createdBy: 'sarah-johnson'
  },
  {
    id: 'task-4',
    projectId: 'proj-1',
    title: 'Performance Optimization',
    description: 'Optimize images, lazy loading, and bundle size',
    status: 'pending',
    priority: 'low',
    assignee: 'Mike Chen',
    dueDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    createdBy: 'sarah-johnson'
  },
  {
    id: 'task-5',
    projectId: 'proj-2',
    title: 'Authentication Flow',
    description: 'Implement secure OAuth login with biometric support',
    status: 'in-progress',
    priority: 'urgent',
    assignee: 'Lisa Wang',
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'david-park'
  },
  {
    id: 'task-6',
    projectId: 'proj-2',
    title: 'Push Notifications',
    description: 'Setup Firebase Cloud Messaging for push notifications',
    status: 'in-review',
    priority: 'high',
    assignee: 'James Miller',
    dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    createdBy: 'david-park'
  },
  {
    id: 'task-7',
    projectId: 'proj-2',
    title: 'App Store Submission',
    description: 'Prepare and submit app to iOS App Store and Google Play',
    status: 'blocked',
    priority: 'urgent',
    assignee: 'David Park',
    dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    createdBy: 'david-park'
  },
  {
    id: 'task-8',
    projectId: 'proj-3',
    title: 'Database Schema Analysis',
    description: 'Analyze current database schema and plan migration strategy',
    status: 'pending',
    priority: 'high',
    assignee: 'Rachel Green',
    dueDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdBy: 'rachel-green'
  }
]
