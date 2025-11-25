import { useState } from 'react'
import { Button } from '@/comp
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/labe
import { Tabs, TabsContent, TabsList, TabsTri
import { Separator } from '@/components/ui/se
import {
  Package,
  Plus,
  Wrench,
  Drop,
  Warning,
  Curren
  CheckCi
  Users,
  FunnelSimple
import 
  ConstructionProj
  Contrac
  Constructi
  Proje
import 
  formatDa
  generateN
  getProjectStatu
  getConst
  searchConstr
  filter
  calcul
  filterProject
  isProjectOve
  getDaysUntilProjectDeadline

  materials: Constructio
  projects: Constructio
  suppliers
  setContract

  materials,
  projects,
  suppliers,
  setContractors
  const 
  const [category
  const [stat
  const [show
  const [editingM

    filterMaterialsByCat
      categoryFilter || und
    segmentFilter || undefined

    filterProjectsByStatus(
      statusFilter || undefi
    typeFilter || undefined

  const totalInventoryValue = calculat
  const plannedPr
  const overBudgetProject
  const handleAddMateri
      id: generateId()
      name: data.na
      unit: data.unit || 'pcs
      reorderLevel: da

      segment: data.segment || 'regular
      projectId: data.projectId,
      warrantyMonths: data.warrantyMonths,
      lastUpdated: Date.now(),
    }
    toast.success('Mate
  }
  const handleAddProject = (data: Partial<ConstructionProject>) => {
 

      type: data.type || 'repair',
      priori
      startDate
      estim
      completi
      projec
      tasks: [
      createdAt:
    }
    toast.success('Project created successfully')
  }
  const handleUpdateStock = (materialId: string, newStock: number)
      prev.map(m => 
          ? { ...m, currentStock: newStock, lastUpdated: Date.
      )
    toast.success('Stock updated')

    setProjects(prev =>
        p.id === projectId

    )
  }
  const renderOverview = () => (
      <div className="grid grid-c
      
            <Hammer size={20} 
   

              <div className="flex items-center 
                <span>{over
            )}
        </Card>
      
            <h3 className="
   

            {urgentMaterials.length > 0 && (
                <Warning size={16} />
              </div>
          </div>

          <div className="flex items-center justify-between mb-4">

          <div className="space-y-2">
              {formatCurrency(projects.reduce((
            <p classNam
            </p>
              <div className
                <span>{overBudgetProjects.length} ov
            )}
        </Card>
        <Card className="p-6 border-l-4 bord
            <h3 className="text-sm font-medium tex
          </div>
            <p className="text-3xl font-se
              {contractors.filter(c => c.totalProject
          </div>
      </div>
      <div className="grid grid-cols-1 lg:
          <div className="flex items-cente
            <Button size
            </Button>
          {activeProjects.l
     
              {activeProjects.slice(0, 5).map(pr
                const daysLeft = getDaysUntilPro
                  <div key={proj
   

                      <Badge className={getProjectStatusColor(projec
                      </Badge>
                    <di
                        <span className
                      </div>
                      {daysLeft !== null &
                          <Calenda
                        </div>
                    </div>
                )
            </div>
        </Card>
        <Card className="p-6">
            <h3 clas
              View All
          </div>
            <p className="text-center text
            <div cla
                
                  <div k
                      <p cla
                        <Ba
     
                          {material.segment}
                      </div>
                    <div classN
   

                      </p>
                  </div>
              })}
          )}
      </div>
  )
  const
     
          <MagnifyingGlass classNa
   

          />
        <Select value={
            <Select
          <SelectContent>
            <SelectItem value="electrical">Electric
            <
       
     
            <SelectItem value="tools">Tools
   

            <SelectValue placeho
          <SelectContent>
            <SelectItem value="regular-maintenance">Regular Maintenance</Sel
            <SelectItem value="emergency-stock">Emergency
        </Select>
          <Plus size={18} className="mr-2" />
        </Button>

        {filteredMaterials.map(materi
          return (
              <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium
                </div>

                <Badge className={getConstructionMaterialCate
                </Ba
              
              </
              <

                  <p className="text-muted-foreground">Sto
                    {material.currentStock} {material.unit}
                </div>
                  <p className="text-muted-foreground">Uni
                
                  <p className="text-
                </div>
                  <p className="text-muted-foreground">Location</p>
                </div>

                <div className="mt-3 
                </div>

              
                
               

                    const newStock = prompt(`Enter new sto
                  }}
                  Update Stock
              </div>
          )
      </div>
      {filteredMaterials.length === 0 && (
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <p cla
              ? 'Try adjusting your filters'
          </p>
            <But
              Add Material
          )}
      )}
  )
  const renderProjec
      <div cla
          <Magni
            pla

          />
        <Select value={statusFilter} onValueChange={setStatusFilte
            <SelectValue placeholder="All Status" />
          <SelectContent>
            <Sel
            <SelectItem value="in-pro
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
            <Sel
          <Selec
            <Se
            

        </Select>
          <Plus size={18} clas
        </Button>

        {filteredProjects.map(project => {
          const daysLe
          const overd
          return
              <div className="flex flex-co
                  <div className="flex items-start gap-3 mb-2">
               
                    </div>
                      <Badge className={getProjectStatusCo
                      </Badge>
                        <Badge variant="destructive">{project.priorit
                    </di


                    <div>
                      <p className="text-sm font-medium capitalize">{
                    <div>
                      <p cla
                    <div>
                      <p className={`tex
                      </p>
                    <div>
                      <p className={`text-sm fo
                          daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'
                      </p>
                  </div>
                  <div class
                      <span className="text-muted-f
                    </div>
                  </div>
                  {project.assignedContractor &&
                      <Users size={16} className="text-muted-foreground" />
                      <span cl
                      </
                  )}

                 
                 
                  
            
               

                      <SelectI
                      <SelectItem value="in-progress">In Progress<
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </div>
            </Card>
        })}

        <Card className="p-12 text-center">
          <h3 c
            {searchTerm || statusFilter
              : 'Create your first project to get started'}
          {!searchTerm && !statusFilter && !typeFilter && (
              <Plus size
            </Button>
        </Card>
    </div>

    <div className="space-y-6">
        <h3 className="text-lg font-semibold"
          <Plus size={18} classN
        </Button>

        {contractors.map(contrac
            <div className="
                <h4 classN
              </div>
                ⭐ {contractor.rating.toFixed(1)}
            </div>
            <div className
                <Badge key={idx} className={getConstructionMaterial
                </Badge>
            </div>
            <Separator cla
            <div classNa
                <
              </d
                <s
            
               
            

   

      </div>
      {contractors.length === 0
          <Users size={48} className="mx-auto text-mute
          <p className="text-muted-foregr
            <Plus size={18} className="mr-2" />
          </Butt
      )}
  )
  return (
      <div>
        <p c

        <TabsList>
            <Hammer size={16} className="mr-2" />
          </TabsTrigger>
            <Package size=
          </TabsTrigger>
            <SelectItem value="all-categories">All Categories</SelectItem>
          </TabsTrigger>
            <Users size={16} className="mr-2" />
          </TabsTrigger>

          {renderOverview()}

          {renderMaterials()}

          {renderProjects()}

          {renderContracto
      </Tabs>
  )



































































































































































































































































































































































































