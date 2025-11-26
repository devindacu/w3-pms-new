import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MagnifyingGlass, DotsThree, PencilSimple, Trash, Tag, Sparkle } from '@phosphor-icons/react'
import type { ExtraService, ExtraServiceCategory } from '@/lib/types'
import { ExtraServiceCategoryDialog } from '@/components/ExtraServiceCategoryDialog'
import { ExtraServiceDialog } from '@/components/ExtraServiceDialog'
import { formatCurrency } from '@/lib/helpers'
import { toast } from 'sonner'

interface ExtraServicesManagementProps {
  services: ExtraService[]
  setServices: (services: ExtraService[]) => void
  categories: ExtraServiceCategory[]
  setCategories: (categories: ExtraServiceCategory[]) => void
  currentUser: { id: string; firstName: string; lastName: string }
}

export function ExtraServicesManagement({
  services,
  setServices,
  categories,
  setCategories,
  currentUser
}: ExtraServicesManagementProps) {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ExtraServiceCategory | null>(null)
  const [selectedService, setSelectedService] = useState<ExtraService | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('services')

  const handleSaveCategory = (category: ExtraServiceCategory) => {
    setCategories((current) => {
      const existing = current.find(c => c.id === category.id)
      if (existing) {
        return current.map(c => c.id === category.id ? category : c)
      }
      return [...current, category]
    })
  }

  const handleDeleteCategory = (categoryId: string) => {
    const hasServices = services.some(s => s.categoryId === categoryId)
    if (hasServices) {
      toast.error('Cannot delete category with existing services')
      return
    }
    setCategories((current) => current.filter(c => c.id !== categoryId))
    toast.success('Category deleted')
  }

  const handleSaveService = (service: ExtraService) => {
    setServices((current) => {
      const existing = current.find(s => s.id === service.id)
      if (existing) {
        return current.map(s => s.id === service.id ? service : s)
      }
      return [...current, service]
    })
  }

  const handleDeleteService = (serviceId: string) => {
    setServices((current) => current.filter(s => s.id !== serviceId))
    toast.success('Service deleted')
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getServiceCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)
  }

  const getCategoryServiceCount = (categoryId: string) => {
    return services.filter(s => s.categoryId === categoryId).length
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'archived':
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Extra Services Management</h1>
          <p className="text-muted-foreground mt-1">Manage service categories and billable extras</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">
            <Sparkle size={16} className="mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag size={16} className="mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setSelectedService(null)
                setServiceDialogOpen(true)
              }}>
                <Plus size={18} className="mr-2" />
                New Service
              </Button>
            </div>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No services found' : 'No services created yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => {
                    const category = getServiceCategory(service.categoryId)
                    return (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{category?.name || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(service.basePrice)}
                            <span className="text-muted-foreground text-sm"> / {service.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>{service.taxRate}%</TableCell>
                        <TableCell className="capitalize">{service.department.replace('-', ' ')}</TableCell>
                        <TableCell>{getStatusBadge(service.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <DotsThree size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedService(service)
                                setServiceDialogOpen(true)
                              }}>
                                <PencilSimple size={16} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteService(service.id)}
                                className="text-destructive"
                              >
                                <Trash size={16} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setSelectedCategory(null)
                setCategoryDialogOpen(true)
              }}>
                <Plus size={18} className="mr-2" />
                New Category
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.length === 0 ? (
              <Card className="col-span-full p-8 text-center text-muted-foreground">
                {searchTerm ? 'No categories found' : 'No categories created yet'}
              </Card>
            ) : (
              filteredCategories.sort((a, b) => a.sortOrder - b.sortOrder).map((category) => (
                <Card key={category.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <DotsThree size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedCategory(category)
                          setCategoryDialogOpen(true)
                        }}>
                          <PencilSimple size={16} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive"
                        >
                          <Trash size={16} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {getCategoryServiceCount(category.id)} services
                    </span>
                    {category.isActive ? (
                      <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ExtraServiceCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={selectedCategory}
        onSave={handleSaveCategory}
        existingCategories={categories}
      />

      <ExtraServiceDialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        service={selectedService}
        onSave={handleSaveService}
        categories={categories}
        currentUser={currentUser}
      />
    </div>
  )
}
