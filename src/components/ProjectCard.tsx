import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Folder, Calendar, DotsThree, Users } from '@phosphor-icons/react'
import { type Project, type Task } from '@/lib/types'
import { formatDate, getProjectStatusColor, calculateProjectProgress, getInitials } from '@/lib/helpers'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  tasks: Task[]
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, tasks, onSelect, onEdit, onDelete }: ProjectCardProps) {
  const progress = calculateProjectProgress(tasks)
  const activeTasks = tasks.filter(t => t.status !== 'completed').length

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer group border-l-4 border-l-primary"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Folder className="text-primary" weight="duotone" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{project.name}</h3>
            <Badge className={cn('text-xs mt-1', getProjectStatusColor(project.status))}>
              {project.status}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <DotsThree size={20} />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {project.description}
      </p>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar size={14} />
            <span>{formatDate(project.endDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>{activeTasks} active tasks</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex -space-x-2">
            {project.teamMembers.slice(0, 3).map((memberId) => (
              <Avatar key={memberId} className="w-7 h-7 border-2 border-card">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(memberId)}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.teamMembers.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-card">
                +{project.teamMembers.length - 3}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users size={14} />
            <span>{project.teamMembers.length}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
