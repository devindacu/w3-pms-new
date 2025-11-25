import { Card } from '@/components/ui/card'
import { ChartBar, FolderOpen, ListChecks, Clock } from '@phosphor-icons/react'
import { type Project, type Task } from '@/lib/types'

interface DashboardStatsProps {
  projects: Project[]
  tasks: Task[]
}

export function DashboardStats({ projects, tasks }: DashboardStatsProps) {
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const overdueTasks = tasks.filter(t => 
    t.dueDate && t.dueDate < Date.now() && t.status !== 'completed'
  ).length

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: FolderOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: ChartBar,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: ListChecks,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Overdue Tasks',
      value: overdueTasks,
      icon: Clock,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={stat.color} size={24} weight="duotone" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
