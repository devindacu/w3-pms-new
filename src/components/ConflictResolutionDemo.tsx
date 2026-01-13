import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  GitMerge,
  Plus,
  Pencil,
  Trash,
  Warning,
  CheckCircle,
  Info,
  ArrowsClockwise,
  Lightning
} from '@phosphor-icons/react'
import { useConflictResolver } from '@/hooks/use-conflict-resolver'
import { ConflictDialog } from './ConflictDialog'
import { ConflictIndicator } from './ConflictIndicator'
import type { Conflict } from '@/lib/conflictResolution'

interface DemoTask {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: number
}

export function ConflictResolutionDemo() {
  const {
    value: tasks,
    setValue: setTasks,
    conflicts,
    pendingConflicts,
    resolveConflict,
    ignoreConflict,
    clearResolvedConflicts,
    hasPendingConflicts
  } = useConflictResolver<DemoTask[]>('conflict-demo-tasks', [], {
    onConflictDetected: (conflict) => {
      toast.warning('Sync conflict detected!', {
        description: 'Changes were made in multiple tabs simultaneously'
      })
    },
    onConflictResolved: (conflict, resolution) => {
      toast.success('Conflict resolved!', {
        description: `Applied ${conflict.strategy} strategy`
      })
    }
  })

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedConflict, setSelectedConflict] = useState<Conflict<DemoTask[]> | null>(null)

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: DemoTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      completed: false,
      priority: 'medium',
      createdAt: Date.now()
    }

    setTasks((current) => [...current, newTask])
    setNewTaskTitle('')
    toast.success('Task added')
  }

  const toggleTask = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId))
    toast.success('Task deleted')
  }

  const updateTaskPriority = (taskId: string, priority: 'low' | 'medium' | 'high') => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, priority } : task
      )
    )
  }

  const handleResolveAll = () => {
    pendingConflicts.forEach((conflict) => {
      resolveConflict(conflict.id, 'last-write-wins')
    })
  }

  const formatTasksForConflict = (tasks: DemoTask[]) => (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="p-2 bg-muted/50 rounded text-sm">
          <div className="flex items-center justify-between">
            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
              {task.title}
            </span>
            <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'}>
              {task.priority}
            </Badge>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <p className="text-muted-foreground text-center py-4">No tasks</p>
      )}
    </div>
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground'
      case 'medium': return 'bg-accent text-accent-foreground'
      case 'low': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <GitMerge size={28} className="text-primary" />
            Conflict Resolution Demo
          </h2>
          <p className="text-muted-foreground mt-1">
            Open multiple tabs and edit the same task simultaneously to trigger conflicts
          </p>
        </div>
        
        {conflicts.length > 0 && (
          <div className="flex items-center gap-2">
            <ConflictIndicator
              conflicts={conflicts}
              onViewConflict={setSelectedConflict}
              onResolveAll={handleResolveAll}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearResolvedConflicts}
            >
              Clear Resolved
            </Button>
          </div>
        )}
      </div>

      <Alert className="border-primary/50 bg-primary/5">
        <Info size={18} />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">How to test conflict resolution:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open this page in 2-3 browser tabs</li>
              <li>In each tab, quickly modify the same task (toggle, change priority, or delete)</li>
              <li>When conflicts are detected, a warning will appear</li>
              <li>Click on the conflict indicator to resolve each conflict manually</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>

      {hasPendingConflicts && (
        <Alert variant="destructive">
          <Warning size={18} />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{pendingConflicts.length}</strong> sync conflict{pendingConflicts.length !== 1 ? 's' : ''} detected. Review and resolve to continue.
            </span>
            <Button size="sm" variant="secondary" onClick={handleResolveAll}>
              <Lightning size={16} className="mr-2" />
              Auto-Resolve All
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Task List</h3>
            <Badge variant="outline">
              {tasks?.length || 0} task{(tasks?.length || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
              </div>
              <Button onClick={addTask} size="icon">
                <Plus size={18} />
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(tasks?.length || 0) === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Info size={32} className="mx-auto mb-2 opacity-50" />
                <p>No tasks yet. Add one to get started!</p>
              </div>
            ) : (
              (tasks || []).map((task) => (
                <Card
                  key={task.id}
                  className={`p-4 transition-all ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed ? (
                        <CheckCircle size={20} className="text-success" weight="fill" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                      )}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={task.priority}
                        onChange={(e) =>
                          updateTaskPriority(task.id, e.target.value as DemoTask['priority'])
                        }
                        className={`text-xs px-2 py-1 rounded border-0 ${getPriorityColor(task.priority)}`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <ArrowsClockwise size={20} />
            Sync Information
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-semibold">{tasks?.length || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="text-2xl font-semibold text-success">
                    {tasks?.filter((t) => t.completed).length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Conflicts</p>
                  <p className="text-2xl font-semibold text-destructive">
                    {conflicts.length}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pending</p>
                  <p className="text-2xl font-semibold text-warning">
                    {pendingConflicts.length}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Conflict History</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {conflicts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No conflicts detected yet. Try editing tasks in multiple tabs!
                  </p>
                ) : (
                  conflicts.slice().reverse().map((conflict) => (
                    <div
                      key={conflict.id}
                      className="p-3 bg-muted/30 rounded-lg text-sm border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            conflict.status === 'pending'
                              ? 'destructive'
                              : conflict.status === 'resolved'
                              ? 'outline'
                              : 'secondary'
                          }
                          className={
                            conflict.status === 'resolved'
                              ? 'bg-success/10 text-success border-success/20'
                              : ''
                          }
                        >
                          {conflict.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conflict.detectedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {conflict.status === 'resolved' && conflict.strategy && (
                        <p className="text-xs text-muted-foreground">
                          Strategy: <span className="font-medium">{conflict.strategy}</span>
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {selectedConflict && (
        <ConflictDialog
          conflict={selectedConflict}
          open={!!selectedConflict}
          onClose={() => setSelectedConflict(null)}
          onResolve={resolveConflict}
          onIgnore={ignoreConflict}
          formatValue={formatTasksForConflict}
        />
      )}
    </div>
  )
}
