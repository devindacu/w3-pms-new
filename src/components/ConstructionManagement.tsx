import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Hammer,
  Package,
  ClipboardText,
  Plus,
  MagnifyingGlass,
  Wrench,
  Lightning,
  Drop,
  Tree,
  Warning,
  Calendar,
  CurrencyDollar,
  TrendUp,
  CheckCircle,
  Clock,
  Users,
  ShoppingCart,
  FunnelSimple
} from '@phosphor-icons/react'
import type { 
  ConstructionMaterial, 
  ConstructionProject, 
  Supplier,
  Contractor,
  InventorySegment,
  ConstructionMaterialCategory,
  ProjectStatus,
  ProjectType
} from '@/lib/types'
import {
  formatCurrency,
  formatDate,
  generateId,
  generateNumber,
  getConstructionMaterialCategoryColor,
  getProjectStatusColor,
  getInventorySegmentColor,
  getConstructionMaterialStockStatus,
  calculateProjectProgress,
  searchConstructionMaterials,
  filterMaterialsByCategory,
  filterMaterialsBySegment,
  getUrgentConstructionMaterials,
  calculateConstructionInventoryValue,
  searchProjects,
  filterProjectsByStatus,
  filterProjectsByType,
  isProjectOverBudget,
  isProjectOverdue,
  getDaysUntilProjectDeadline
} from '@/lib/helpers'

interface ConstructionManagementProps {
  materials: ConstructionMaterial[]
  setMaterials: (materials: ConstructionMaterial[] | ((prev: ConstructionMaterial[]) => ConstructionMaterial[])) => void
  projects: ConstructionProject[]
  setProjects: (projects: ConstructionProject[] | ((prev: ConstructionProject[]) => ConstructionProject[])) => void
  suppliers: Supplier[]
  contractors: Contractor[]
  setContractors: (contractors: Contractor[] | ((prev: Contractor[]) => Contractor[])) => void
}

export function ConstructionManagement({
  materials,
  setMaterials,
  projects,
  setProjects,
  suppliers,
  contractors,
  setContractors
}: ConstructionManagementProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'projects' | 'contractors'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [segmentFilter, setSegmentFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [showMaterialDialog, setShowMaterialDialog] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<ConstructionMaterial | null>(null)
  const [editingProject, setEditingProject] = useState<ConstructionProject | null>(null)

  const filteredMaterials = filterMaterialsBySegment(
    filterMaterialsByCategory(
      searchTerm ? searchConstructionMaterials(materials, searchTerm) : materials,
      categoryFilter || undefined
    ),
    segmentFilter || undefined
  )

  const filteredProjects = filterProjectsByType(
    filterProjectsByStatus(
      searchTerm ? searchProjects(projects, searchTerm) : projects,
      statusFilter || undefined
    ),
    typeFilter || undefined
  )

  const urgentMaterials = getUrgentConstructionMaterials(materials)
  const totalInventoryValue = calculateConstructionInventoryValue(materials)
  const activeProjects = projects.filter(p => p.status === 'in-progress')
  const plannedProjects = projects.filter(p => p.status === 'planning' || p.status === 'approved')
  const overdueProjects = projects.filter(p => isProjectOverdue(p))
  const overBudgetProjects = projects.filter(p => isProjectOverBudget(p))

  const handleAddMaterial = (data: Partial<ConstructionMaterial>) => {
    const newMaterial: ConstructionMaterial = {
      id: generateId(),
      materialId: generateNumber('MAT'),
      name: data.name || '',
      category: data.category || 'general-building',
      unit: data.unit || 'pcs',
      currentStock: data.currentStock || 0,
      reorderLevel: data.reorderLevel || 10,
      reorderQuantity: data.reorderQuantity || 50,
      unitCost: data.unitCost || 0,
      supplierIds: data.supplierIds || [],
      segment: data.segment || 'regular-maintenance',
      storeLocation: data.storeLocation || 'Main Warehouse',
      projectId: data.projectId,
      specifications: data.specifications,
      warrantyMonths: data.warrantyMonths,
      notes: data.notes,
      lastUpdated: Date.now(),
      createdAt: Date.now()
    }
    setMaterials(prev => [...prev, newMaterial])
    toast.success('Material added successfully')
    setShowMaterialDialog(false)
  }

  const handleAddProject = (data: Partial<ConstructionProject>) => {
    const newProject: ConstructionProject = {
      id: generateId(),
      projectId: generateNumber('PRJ'),
      name: data.name || '',
      description: data.description || '',
      type: data.type || 'repair',
      status: data.status || 'planning',
      priority: data.priority || 'medium',
      location: data.location || '',
      startDate: data.startDate,
      endDate: data.endDate,
      estimatedBudget: data.estimatedBudget || 0,
      actualCost: 0,
      completionPercentage: 0,
      assignedContractor: data.assignedContractor,
      projectManager: data.projectManager,
      materials: [],
      tasks: [],
      notes: data.notes,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setProjects(prev => [...prev, newProject])
    toast.success('Project created successfully')
    setShowProjectDialog(false)
  }

  const handleUpdateStock = (materialId: string, newStock: number) => {
    setMaterials(prev => 
      prev.map(m => 
        m.id === materialId 
          ? { ...m, currentStock: newStock, lastUpdated: Date.now() } 
          : m
      )
    )
    toast.success('Stock updated')
  }

  const handleUpdateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, status, updatedAt: Date.now() }
          : p
      )
    )
    toast.success('Project status updated')
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Projects</h3>
            <Hammer size={20} className="text-accent" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{activeProjects.length}</p>
            <p className="text-sm text-muted-foreground">{plannedProjects.length} planned</p>
            {overdueProjects.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <Warning size={16} />
                <span>{overdueProjects.length} overdue</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Materials Inventory</h3>
            <Package size={20} className="text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{materials.length}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(totalInventoryValue)} value</p>
            {urgentMaterials.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <Warning size={16} />
                <span>{urgentMaterials.length} urgent</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Budget Status</h3>
            <CurrencyDollar size={20} className="text-success" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">
              {formatCurrency(projects.reduce((sum, p) => sum + p.actualCost, 0))}
            </p>
            <p className="text-sm text-muted-foreground">
              of {formatCurrency(projects.reduce((sum, p) => sum + p.estimatedBudget, 0))}
            </p>
            {overBudgetProjects.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <TrendUp size={16} />
                <span>{overBudgetProjects.length} over budget</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Contractors</h3>
            <Users size={20} className="text-secondary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{contractors.length}</p>
            <p className="text-sm text-muted-foreground">
              {contractors.filter(c => c.totalProjects > 0).length} active
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Projects</h3>
            <Button size="sm" onClick={() => setActiveTab('projects')}>
              View All
            </Button>
          </div>
          {activeProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active projects</p>
          ) : (
            <div className="space-y-3">
              {activeProjects.slice(0, 5).map(project => {
                const progress = calculateProjectProgress(project)
                const daysLeft = getDaysUntilProjectDeadline(project)
                return (
                  <div key={project.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                      </div>
                      <Badge className={getProjectStatusColor(project.status)} variant="outline">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                      {daysLeft !== null && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={14} />
                          <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Low Stock Materials</h3>
            <Button size="sm" onClick={() => setActiveTab('materials')}>
              View All
            </Button>
          </div>
          {urgentMaterials.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">All materials stocked well</p>
          ) : (
            <div className="space-y-3">
              {urgentMaterials.slice(0, 5).map(material => {
                const status = getConstructionMaterialStockStatus(material)
                return (
                  <div key={material.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{material.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getConstructionMaterialCategoryColor(material.category)} variant="outline">
                          {material.category}
                        </Badge>
                        <Badge className={getInventorySegmentColor(material.segment)} variant="outline">
                          {material.segment}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${status.color}`}>
                        {material.currentStock} {material.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reorder at {material.reorderLevel}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )

  const renderMaterials = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="carpentry">Carpentry</SelectItem>
            <SelectItem value="masonry">Masonry</SelectItem>
            <SelectItem value="painting">Painting</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
            <SelectItem value="hardware">Hardware</SelectItem>
            <SelectItem value="safety-equipment">Safety Equipment</SelectItem>
            <SelectItem value="tools">Tools</SelectItem>
            <SelectItem value="general-building">General Building</SelectItem>
          </SelectContent>
        </Select>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Segments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Segments</SelectItem>
            <SelectItem value="regular-maintenance">Regular Maintenance</SelectItem>
            <SelectItem value="project-construction">Project Construction</SelectItem>
            <SelectItem value="emergency-stock">Emergency Stock</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowMaterialDialog(true)}>
          <Plus size={18} className="mr-2" />
          Add Material
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map(material => {
          const status = getConstructionMaterialStockStatus(material)
          return (
            <Card key={material.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{material.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{material.materialId}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getConstructionMaterialCategoryColor(material.category)} variant="outline">
                  {material.category}
                </Badge>
                <Badge className={getInventorySegmentColor(material.segment)} variant="outline">
                  {material.segment}
                </Badge>
              </div>

              <Separator className="my-3" />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Stock</p>
                  <p className={`font-semibold ${status.color}`}>
                    {material.currentStock} {material.unit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit Cost</p>
                  <p className="font-semibold">{formatCurrency(material.unitCost)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reorder Level</p>
                  <p className="font-semibold">{material.reorderLevel} {material.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-semibold text-xs">{material.storeLocation}</p>
                </div>
              </div>

              {material.specifications && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Specs: {material.specifications}</p>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  <ShoppingCart size={16} className="mr-1" />
                  Order
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const newStock = prompt(`Enter new stock for ${material.name}:`, material.currentStock.toString())
                    if (newStock) handleUpdateStock(material.id, parseInt(newStock))
                  }}
                >
                  Update Stock
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <Card className="p-12 text-center">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Materials Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter || segmentFilter
              ? 'Try adjusting your filters'
              : 'Add your first material to get started'}
          </p>
          {!searchTerm && !categoryFilter && !segmentFilter && (
            <Button onClick={() => setShowMaterialDialog(true)}>
              <Plus size={18} className="mr-2" />
              Add Material
            </Button>
          )}
        </Card>
      )}
    </div>
  )

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="renovation">Renovation</SelectItem>
            <SelectItem value="new-construction">New Construction</SelectItem>
            <SelectItem value="repair">Repair</SelectItem>
            <SelectItem value="upgrade">Upgrade</SelectItem>
            <SelectItem value="preventive-maintenance">Preventive Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowProjectDialog(true)}>
          <Plus size={18} className="mr-2" />
          New Project
        </Button>
      </div>

      <div className="space-y-4">
        {filteredProjects.map(project => {
          const progress = calculateProjectProgress(project)
          const daysLeft = getDaysUntilProjectDeadline(project)
          const overBudget = isProjectOverBudget(project)
          const overdue = isProjectOverdue(project)

          return (
            <Card key={project.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{project.projectId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getProjectStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      {project.priority === 'urgent' || project.priority === 'critical' ? (
                        <Badge variant="destructive">{project.priority}</Badge>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <p className="text-sm font-medium capitalize">{project.type.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Location</p>
                      <p className="text-sm font-medium">{project.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Budget</p>
                      <p className={`text-sm font-medium ${overBudget ? 'text-destructive' : ''}`}>
                        {formatCurrency(project.actualCost)} / {formatCurrency(project.estimatedBudget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                      <p className={`text-sm font-medium ${overdue ? 'text-destructive' : ''}`}>
                        {daysLeft !== null ? (
                          daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'
                        ) : 'No deadline'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Completion Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  {project.assignedContractor && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <Users size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Contractor:</span>
                      <span className="font-medium">
                        {contractors.find(c => c.id === project.assignedContractor)?.name || 'Unknown'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2">
                  <Button size="sm" variant="outline">
                    <ClipboardText size={16} className="mr-1" />
                    Details
                  </Button>
                  <Select
                    value={project.status}
                    onValueChange={(value) => handleUpdateProjectStatus(project.id, value as ProjectStatus)}
                  >
                    <SelectTrigger className="w-full lg:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="p-12 text-center">
          <Hammer size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter || typeFilter
              ? 'Try adjusting your filters'
              : 'Create your first project to get started'}
          </p>
          {!searchTerm && !statusFilter && !typeFilter && (
            <Button onClick={() => setShowProjectDialog(true)}>
              <Plus size={18} className="mr-2" />
              New Project
            </Button>
          )}
        </Card>
      )}
    </div>
  )

  const renderContractors = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contractors & Suppliers</h3>
        <Button>
          <Plus size={18} className="mr-2" />
          Add Contractor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contractors.map(contractor => (
          <Card key={contractor.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium">{contractor.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{contractor.contactPerson}</p>
              </div>
              <Badge variant="outline">
                ⭐ {contractor.rating.toFixed(1)}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {contractor.specializations.slice(0, 3).map((spec, idx) => (
                <Badge key={idx} className={getConstructionMaterialCategoryColor(spec)} variant="outline">
                  {spec}
                </Badge>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projects</span>
                <span className="font-medium">{contractor.totalProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spent</span>
                <span className="font-medium">{formatCurrency(contractor.totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-xs">{contractor.phone}</span>
              </div>
            </div>

            <Button size="sm" variant="outline" className="w-full mt-3">
              View Details
            </Button>
          </Card>
        ))}
      </div>

      {contractors.length === 0 && (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Contractors</h3>
          <p className="text-muted-foreground mb-4">Add contractors to manage your projects</p>
          <Button>
            <Plus size={18} className="mr-2" />
            Add Contractor
          </Button>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold">Maintenance & Construction</h1>
        <p className="text-muted-foreground mt-1">Engineering materials, projects, and contractor management</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">
            <Hammer size={16} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="materials">
            <Package size={16} className="mr-2" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="projects">
            <ClipboardText size={16} className="mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="contractors">
            <Users size={16} className="mr-2" />
            Contractors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          {renderMaterials()}
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          {renderProjects()}
        </TabsContent>

        <TabsContent value="contractors" className="mt-6">
          {renderContractors()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
