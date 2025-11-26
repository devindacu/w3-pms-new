import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  MapPin,
  CalendarBlank,
  ClipboardText,
  ChartLine,
  Plus,
  MagnifyingGlass,
  ChefHat,
  Timer,
  CheckCircle,
  Warning,
  ClockCounterClockwise
} from '@phosphor-icons/react'
import {
  type KitchenStation,
  type KitchenStaff,
  type ProductionSchedule,
  type KitchenInventoryIssue,
  type WasteTracking,
  type Employee,
  type FoodItem
} from '@/lib/types'
import { ProductionScheduleDialog } from './ProductionScheduleDialog'
import { KitchenStaffDialog } from './KitchenStaffDialog'
import { KitchenStationDialog } from './KitchenStationDialog'
import { InventoryIssueDialog } from './InventoryIssueDialog'
import { WasteTrackingDialog } from './WasteTrackingDialog'
import { formatCurrency } from '@/lib/helpers'

interface KitchenManagementProps {
  stations: KitchenStation[]
  setStations: (stations: KitchenStation[] | ((prev: KitchenStation[]) => KitchenStation[])) => void
  staff: KitchenStaff[]
  setStaff: (staff: KitchenStaff[] | ((prev: KitchenStaff[]) => KitchenStaff[])) => void
  schedules: ProductionSchedule[]
  setSchedules: (schedules: ProductionSchedule[] | ((prev: ProductionSchedule[]) => ProductionSchedule[])) => void
  inventoryIssues: KitchenInventoryIssue[]
  setInventoryIssues: (issues: KitchenInventoryIssue[] | ((prev: KitchenInventoryIssue[]) => KitchenInventoryIssue[])) => void
  wasteTracking: WasteTracking[]
  setWasteTracking: (waste: WasteTracking[] | ((prev: WasteTracking[]) => WasteTracking[])) => void
  employees: Employee[]
  foodItems: FoodItem[]
}

export function KitchenManagement({
  stations,
  setStations,
  staff,
  setStaff,
  schedules,
  setSchedules,
  inventoryIssues,
  setInventoryIssues,
  wasteTracking,
  setWasteTracking,
  employees,
  foodItems
}: KitchenManagementProps) {
  const [activeTab, setActiveTab] = useState('stations')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStation, setSelectedStation] = useState<KitchenStation | undefined>()
  const [selectedStaff, setSelectedStaff] = useState<KitchenStaff | undefined>()
  const [selectedSchedule, setSelectedSchedule] = useState<ProductionSchedule | undefined>()
  const [selectedIssue, setSelectedIssue] = useState<KitchenInventoryIssue | undefined>()
  const [selectedWaste, setSelectedWaste] = useState<WasteTracking | undefined>()
  const [isStationDialogOpen, setIsStationDialogOpen] = useState(false)
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false)
  const [isWasteDialogOpen, setIsWasteDialogOpen] = useState(false)

  const today = new Date().setHours(0, 0, 0, 0)
  const todaySchedules = schedules.filter(s => new Date(s.date).setHours(0, 0, 0, 0) === today)
  const activeStaff = staff.filter(s => s.status === 'active')
  const todayWaste = wasteTracking.filter(w => new Date(w.date).setHours(0, 0, 0, 0) === today)
  const pendingIssues = inventoryIssues.filter(i => i.status === 'pending')

  const getStationColor = (type: string) => {
    const colors: Record<string, string> = {
      'hot-kitchen': 'border-l-destructive',
      'cold-kitchen': 'border-l-primary',
      'pastry': 'border-l-accent',
      'butchery': 'border-l-secondary',
      'prep-station': 'border-l-success',
      'desserts': 'border-l-accent',
      'grill': 'border-l-destructive',
      'fry-station': 'border-l-destructive',
      'salad-bar': 'border-l-success',
      'bakery': 'border-l-accent'
    }
    return colors[type] || 'border-l-muted'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-success text-success-foreground',
      'on-leave': 'bg-accent text-accent-foreground',
      'off-duty': 'bg-muted text-muted-foreground',
      'draft': 'bg-muted text-muted-foreground',
      'scheduled': 'bg-primary text-primary-foreground',
      'in-progress': 'bg-accent text-accent-foreground',
      'completed': 'bg-success text-success-foreground',
      'cancelled': 'bg-destructive text-destructive-foreground',
      'pending': 'bg-accent text-accent-foreground',
      'issued': 'bg-success text-success-foreground',
      'rejected': 'bg-destructive text-destructive-foreground'
    }
    return colors[status] || 'bg-muted text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Kitchen Management</h2>
          <p className="text-muted-foreground mt-1">Manage stations, staff assignments, production scheduling, and workflows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Stations</h3>
            <MapPin size={20} className="text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{stations.filter(s => s.isActive).length}</p>
            <p className="text-sm text-muted-foreground">of {stations.length} total</p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Staff On Duty</h3>
            <Users size={20} className="text-success" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{activeStaff.length}</p>
            <p className="text-sm text-muted-foreground">{staff.filter(s => s.status === 'on-leave').length} on leave</p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Today's Production</h3>
            <CalendarBlank size={20} className="text-accent" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{todaySchedules.length}</p>
            <p className="text-sm text-muted-foreground">
              {todaySchedules.filter(s => s.status === 'completed').length} completed
            </p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Issues</h3>
            <Warning size={20} className="text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{pendingIssues.length}</p>
            <p className="text-sm text-muted-foreground">inventory requests</p>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stations" className="gap-2">
            <MapPin size={18} />
            Stations
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2">
            <Users size={18} />
            Staff
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2">
            <CalendarBlank size={18} />
            Production
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <ClipboardText size={18} />
            Inventory Issues
          </TabsTrigger>
          <TabsTrigger value="waste" className="gap-2">
            <ChartLine size={18} />
            Waste Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setSelectedStation(undefined); setIsStationDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              Add Station
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations
              .filter(station =>
                station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                station.type.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((station) => (
                <Card key={station.id} className={`p-6 border-l-4 ${getStationColor(station.type)} cursor-pointer hover:shadow-lg transition-shadow`}
                  onClick={() => { setSelectedStation(station); setIsStationDialogOpen(true) }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{station.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{station.type.replace('-', ' ')}</p>
                      </div>
                      <Badge variant={station.isActive ? 'default' : 'secondary'}>
                        {station.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{station.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{station.capacity} units/hour</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Assigned Staff:</span>
                        <span className="font-medium">{station.assignedStaff.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Equipment:</span>
                        <span className="font-medium">{station.equipment.length} items</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>

          {stations.length === 0 && (
            <Card className="p-16 text-center">
              <MapPin size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Kitchen Stations</h3>
              <p className="text-muted-foreground mb-6">Set up your first kitchen station to start managing production workflows</p>
              <Button onClick={() => { setSelectedStation(undefined); setIsStationDialogOpen(true) }}>
                <Plus size={18} className="mr-2" />
                Add First Station
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="staff" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setSelectedStaff(undefined); setIsStaffDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              Add Staff
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {staff
              .filter(s =>
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.role.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((member) => (
                <Card key={member.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => { setSelectedStaff(member); setIsStaffDialogOpen(true) }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{member.firstName} {member.lastName}</h3>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {member.role.replace('-', ' ')} • {member.shiftType} shift
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-8">
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{member.performanceRating.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{member.tasksCompleted}</p>
                        <p className="text-xs text-muted-foreground">Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{member.efficiency}%</p>
                        <p className="text-xs text-muted-foreground">Efficiency</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{member.specializations.length}</p>
                        <p className="text-xs text-muted-foreground">Skills</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>

          {staff.length === 0 && (
            <Card className="p-16 text-center">
              <Users size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Kitchen Staff</h3>
              <p className="text-muted-foreground mb-6">Add your kitchen staff to manage assignments and track performance</p>
              <Button onClick={() => { setSelectedStaff(undefined); setIsStaffDialogOpen(true) }}>
                <Plus size={18} className="mr-2" />
                Add First Staff Member
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setSelectedSchedule(undefined); setIsScheduleDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              Create Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {schedules
              .filter(s =>
                s.scheduleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.menuName && s.menuName.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .sort((a, b) => b.date - a.date)
              .map((schedule) => (
                <Card key={schedule.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => { setSelectedSchedule(schedule); setIsScheduleDialogOpen(true) }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{schedule.scheduleId}</h3>
                          <Badge className={getStatusColor(schedule.status)}>
                            {schedule.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(schedule.date).toLocaleDateString()} • {schedule.shiftType} shift
                          {schedule.menuName && ` • ${schedule.menuName}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Efficiency</p>
                        <p className="text-2xl font-semibold">{schedule.efficiency || 0}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Recipes</p>
                        <p className="text-lg font-semibold">{schedule.totalRecipes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Portions</p>
                        <p className="text-lg font-semibold">{schedule.totalPortions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Staff</p>
                        <p className="text-lg font-semibold">{schedule.assignedStaff.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Est. Cost</p>
                        <p className="text-lg font-semibold">{formatCurrency(schedule.estimatedCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Est. Revenue</p>
                        <p className="text-lg font-semibold text-success">{formatCurrency(schedule.estimatedRevenue)}</p>
                      </div>
                    </div>

                    {schedule.status === 'completed' && schedule.actualCost && schedule.actualRevenue && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Actual Cost</p>
                          <p className="text-lg font-semibold">{formatCurrency(schedule.actualCost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Actual Revenue</p>
                          <p className="text-lg font-semibold text-success">{formatCurrency(schedule.actualRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Profit</p>
                          <p className="text-lg font-semibold text-success">
                            {formatCurrency(schedule.actualRevenue - schedule.actualCost)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
          </div>

          {schedules.length === 0 && (
            <Card className="p-16 text-center">
              <CalendarBlank size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Production Schedules</h3>
              <p className="text-muted-foreground mb-6">Create your first production schedule to plan kitchen operations</p>
              <Button onClick={() => { setSelectedSchedule(undefined); setIsScheduleDialogOpen(true) }}>
                <Plus size={18} className="mr-2" />
                Create First Schedule
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search inventory issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setSelectedIssue(undefined); setIsIssueDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              Request Items
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {inventoryIssues
              .filter(issue =>
                issue.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .sort((a, b) => b.requestedAt - a.requestedAt)
              .map((issue) => (
                <Card key={issue.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => { setSelectedIssue(issue); setIsIssueDialogOpen(true) }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{issue.issueNumber}</h3>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Requested by {issue.requestedBy} • {new Date(issue.requestedAt).toLocaleString()}
                          {issue.station && ` • ${issue.station}`}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Items</p>
                        <p className="text-lg font-semibold">{issue.items.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Requested For</p>
                        <p className="text-lg font-semibold">{issue.requestedFor}</p>
                      </div>
                      {issue.issuedBy && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Issued By</p>
                          <p className="text-lg font-semibold">{issue.issuedBy}</p>
                        </div>
                      )}
                    </div>

                    {issue.items.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Items Preview:</p>
                        <div className="flex flex-wrap gap-2">
                          {issue.items.slice(0, 5).map((item) => (
                            <Badge key={item.id} variant="outline">
                              {item.itemName} ({item.issuedQuantity || item.requestedQuantity} {item.unit})
                            </Badge>
                          ))}
                          {issue.items.length > 5 && (
                            <Badge variant="outline">+{issue.items.length - 5} more</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
          </div>

          {inventoryIssues.length === 0 && (
            <Card className="p-16 text-center">
              <ClipboardText size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Inventory Issues</h3>
              <p className="text-muted-foreground mb-6">Request inventory items for kitchen operations and track their issuance</p>
              <Button onClick={() => { setSelectedIssue(undefined); setIsIssueDialogOpen(true) }}>
                <Plus size={18} className="mr-2" />
                Request First Items
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="waste" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search waste tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setSelectedWaste(undefined); setIsWasteDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              Log Waste
            </Button>
          </div>

          {todayWaste.length > 0 && (
            <Card className="p-6 border-l-4 border-l-destructive">
              <h3 className="font-semibold text-lg mb-4">Today's Waste Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Entries</p>
                  <p className="text-2xl font-semibold">{todayWaste.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Items</p>
                  <p className="text-2xl font-semibold">
                    {todayWaste.reduce((sum, w) => sum + w.items.length, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                  <p className="text-2xl font-semibold text-destructive">
                    {formatCurrency(todayWaste.reduce((sum, w) => sum + w.totalWasteCost, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Preventable</p>
                  <p className="text-2xl font-semibold">
                    {todayWaste.reduce((sum, w) => sum + w.items.filter(i => i.preventable).length, 0)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4">
            {wasteTracking
              .filter(waste =>
                waste.wasteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                waste.station.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .sort((a, b) => b.date - a.date)
              .map((waste) => (
                <Card key={waste.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => { setSelectedWaste(waste); setIsWasteDialogOpen(true) }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{waste.wasteId}</h3>
                          {waste.supervisorApproval && (
                            <Badge variant="outline" className="bg-success text-success-foreground">
                              <CheckCircle size={14} className="mr-1" />
                              Approved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(waste.date).toLocaleDateString()} • {waste.shiftType} shift • {waste.station}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Waste</p>
                        <p className="text-2xl font-semibold text-destructive">{formatCurrency(waste.totalWasteCost)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Items</p>
                        <p className="text-lg font-semibold">{waste.items.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Preventable</p>
                        <p className="text-lg font-semibold">{waste.items.filter(i => i.preventable).length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reported By</p>
                        <p className="text-lg font-semibold">{waste.reportedBy}</p>
                      </div>
                    </div>

                    {waste.items.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Top Waste Items:</p>
                        <div className="space-y-1">
                          {waste.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span>{item.itemName}</span>
                              <span className="text-muted-foreground">
                                {item.quantity} {item.unit} • {formatCurrency(item.cost)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
          </div>

          {wasteTracking.length === 0 && (
            <Card className="p-16 text-center">
              <ChartLine size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Waste Tracking</h3>
              <p className="text-muted-foreground mb-6">Start tracking kitchen waste to identify opportunities for cost reduction</p>
              <Button onClick={() => { setSelectedWaste(undefined); setIsWasteDialogOpen(true) }}>
                <Plus size={18} className="mr-2" />
                Log First Waste Entry
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <KitchenStationDialog
        open={isStationDialogOpen}
        onOpenChange={setIsStationDialogOpen}
        station={selectedStation}
        stations={stations}
        setStations={setStations}
        staff={staff}
      />

      <KitchenStaffDialog
        open={isStaffDialogOpen}
        onOpenChange={setIsStaffDialogOpen}
        staff={selectedStaff}
        allStaff={staff}
        setStaff={setStaff}
        employees={employees}
        stations={stations}
      />

      <ProductionScheduleDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        schedule={selectedSchedule}
        schedules={schedules}
        setSchedules={setSchedules}
        staff={staff}
        stations={stations}
      />

      <InventoryIssueDialog
        open={isIssueDialogOpen}
        onOpenChange={setIsIssueDialogOpen}
        issue={selectedIssue}
        issues={inventoryIssues}
        setIssues={setInventoryIssues}
        foodItems={foodItems}
        stations={stations}
        staff={staff}
      />

      <WasteTrackingDialog
        open={isWasteDialogOpen}
        onOpenChange={setIsWasteDialogOpen}
        waste={selectedWaste}
        wasteTracking={wasteTracking}
        setWasteTracking={setWasteTracking}
        stations={stations}
        staff={staff}
        foodItems={foodItems}
      />
    </div>
  )
}
