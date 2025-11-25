import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { DashboardStats } from '@/components/DashboardStats'
import { ProjectCard } from '@/components/ProjectCard'
import { TaskCard } from '@/components/TaskCard'
import { ProjectDialog } from '@/components/ProjectDialog'
import { TaskDialog } from '@/components/TaskDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, MagnifyingGlass, ArrowLeft, Database } from '@phosphor-icons/react'
import { type Project, type Task } from '@/lib/types'
import { generateId, filterProjects, sortProjects, calculateProjectProgress } from '@/lib/helpers'
import { sampleProjects, sampleTasks } from '@/lib/sampleData'

type View = 'dashboard' | 'projects' | 'analytics' | 'team' | 'settings'

function App() {
  const [projects, setProjects] = useKV<Project[]>('w3-pms-projects', [])
  const [tasks, setTasks] = useKV<Task[]>('w3-pms-tasks', [])
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date')
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  const loadSampleData = () => {
    setProjects(sampleProjects)
    setTasks(sampleTasks)
    toast.success('Sample data loaded successfully')
  }

  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: generateId(),
      name: projectData.name || '',
      description: projectData.description || '',
      status: projectData.status || 'planning',
      priority: projectData.priority || 'medium',
      startDate: projectData.startDate || Date.now(),
      endDate: projectData.endDate || Date.now(),
      projectManager: projectData.projectManager || '',
      teamMembers: projectData.teamMembers || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'current-user'
    }
    setProjects((current) => [...(current || []), newProject])
    toast.success('Project created successfully')
  }

  const handleUpdateProject = (projectData: Partial<Project>) => {
    if (!editingProject) return
    setProjects((current) =>
      (current || []).map((p) =>
        p.id === editingProject.id
          ? { ...p, ...projectData, updatedAt: Date.now() }
          : p
      )
    )
    toast.success('Project updated successfully')
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects((current) => (current || []).filter((p) => p.id !== projectId))
    setTasks((current) => (current || []).filter((t) => t.projectId !== projectId))
    setSelectedProject(null)
    toast.success('Project deleted successfully')
  }

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: generateId(),
      projectId: taskData.projectId || selectedProject?.id || '',
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee,
      dueDate: taskData.dueDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'current-user'
    }
    setTasks((current) => [...(current || []), newTask])
    toast.success('Task created successfully')
  }

  const handleUpdateTask = (taskData: Partial<Task>) => {
    if (!editingTask) return
    setTasks((current) =>
      (current || []).map((t) =>
        t.id === editingTask.id
          ? { 
              ...t, 
              ...taskData, 
              updatedAt: Date.now(),
              completedAt: taskData.status === 'completed' ? Date.now() : t.completedAt
            }
          : t
      )
    )
    toast.success('Task updated successfully')
  }

  const handleTaskStatusChange = (taskId: string, completed: boolean) => {
    setTasks((current) =>
      (current || []).map((t) =>
        t.id === taskId
          ? { 
              ...t, 
              status: completed ? 'completed' : 'pending',
              completedAt: completed ? Date.now() : undefined,
              updatedAt: Date.now()
            }
          : t
      )
    )
  }

  const filteredProjects = sortProjects(filterProjects(projects || [], searchTerm), sortBy)
  const projectTasks = selectedProject ? (tasks || []).filter(t => t.projectId === selectedProject.id) : []

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your project overview</p>
      </div>

      <DashboardStats projects={projects || []} tasks={tasks || []} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Button onClick={() => {
            setEditingProject(undefined)
            setProjectDialogOpen(true)
          }}>
            <Plus size={18} className="mr-2" />
            New Project
          </Button>
        </div>

        {(projects || []).length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first project or load sample data
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setProjectDialogOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Create First Project
                </Button>
                <Button variant="outline" onClick={loadSampleData}>
                  <Database size={18} className="mr-2" />
                  Load Sample Data
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(projects || []).slice(0, 6).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={(tasks || []).filter(t => t.projectId === project.id)}
                onSelect={() => setSelectedProject(project)}
                onEdit={() => {
                  setEditingProject(project)
                  setProjectDialogOpen(true)
                }}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all your projects</p>
        </div>
        <Button onClick={() => {
          setEditingProject(undefined)
          setProjectDialogOpen(true)
        }}>
          <Plus size={18} className="mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Created</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by creating your first project or load sample data'
              }
            </p>
            {!searchTerm && (
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setProjectDialogOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Create First Project
                </Button>
                <Button variant="outline" onClick={loadSampleData}>
                  <Database size={18} className="mr-2" />
                  Load Sample Data
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={(tasks || []).filter(t => t.projectId === project.id)}
              onSelect={() => setSelectedProject(project)}
              onEdit={() => {
                setEditingProject(project)
                setProjectDialogOpen(true)
              }}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderProjectDetail = () => {
    if (!selectedProject) return null

    const progress = calculateProjectProgress(projectTasks)

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedProject(null)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">{selectedProject.name}</h1>
            <p className="text-muted-foreground mt-1">{selectedProject.description}</p>
          </div>
          <Button onClick={() => {
            setEditingTask(undefined)
            setTaskDialogOpen(true)
          }}>
            <Plus size={18} className="mr-2" />
            New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Progress</p>
            <p className="text-2xl font-semibold">{progress}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
            <p className="text-2xl font-semibold">{projectTasks.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-semibold">
              {projectTasks.filter(t => t.status === 'completed').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Team Size</p>
            <p className="text-2xl font-semibold">{selectedProject.teamMembers.length}</p>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          {projectTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start organizing work by creating tasks
                </p>
                <Button onClick={() => setTaskDialogOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Create First Task
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSelect={() => setSelectedTask(task)}
                  onStatusChange={(completed) => handleTaskStatusChange(task.id, completed)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderComingSoon = (title: string) => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-1">This feature is coming soon</p>
      </div>
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">Under Development</h3>
          <p className="text-muted-foreground">
            We're working hard to bring you this feature. Stay tuned!
          </p>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {selectedProject ? (
            renderProjectDetail()
          ) : currentView === 'dashboard' ? (
            renderDashboard()
          ) : currentView === 'projects' ? (
            renderProjects()
          ) : currentView === 'analytics' ? (
            renderComingSoon('Analytics')
          ) : currentView === 'team' ? (
            renderComingSoon('Team')
          ) : (
            renderComingSoon('Settings')
          )}
        </div>
      </main>

      <ProjectDialog
        project={editingProject}
        open={projectDialogOpen}
        onClose={() => {
          setProjectDialogOpen(false)
          setEditingProject(undefined)
        }}
        onSave={editingProject ? handleUpdateProject : handleCreateProject}
      />

      <TaskDialog
        task={editingTask}
        projectId={selectedProject?.id || ''}
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false)
          setEditingTask(undefined)
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
      />

      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App