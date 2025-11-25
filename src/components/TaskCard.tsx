import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Flag } from '@phosphor-icons/react'
import { type Task } from '@/lib/types'
import { formatDate, getTaskStatusColor, getPriorityColor, isOverdue, getDaysUntilDue, getInitials } from '@/lib/helpers'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onSelect: () => void
  onStatusChange: (completed: boolean) => void
}

export function TaskCard({ task, onSelect, onStatusChange }: TaskCardProps) {
  const isCompleted = task.status === 'completed'
  const overdue = isOverdue(task.dueDate)
  const daysUntilDue = getDaysUntilDue(task.dueDate)

  return (
    <Card 
      className="p-4 hover:shadow-md transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onStatusChange}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={cn(
              'font-medium text-sm',
              isCompleted && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
              <Flag 
                size={16} 
                weight="fill" 
                className={getPriorityColor(task.priority)}
              />
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', getTaskStatusColor(task.status))}>
                {task.status}
              </Badge>
              
              {task.dueDate && (
                <div className={cn(
                  'flex items-center gap-1 text-xs',
                  overdue ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  <Calendar size={12} />
                  <span>
                    {overdue ? 'Overdue' : daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : formatDate(task.dueDate)}
                  </span>
                </div>
              )}
            </div>

            {task.assignee && (
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(task.assignee)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
