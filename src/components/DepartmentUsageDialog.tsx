import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ChartBar, Users, Plus, TrendUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { formatCurrency } from '@/lib/helpers'
import type { Department } from '@/lib/types'

interface UnifiedInventoryItem {
  id: string
  productId: string
  name: string
  category: string
  source: 'food' | 'amenities' | 'construction' | 'general'
  unit: string
  currentStock: number
  reorderLevel: number
  reorderQuantity: number
  unitCost: number
  totalValue: number
  supplierIds: string[]
  storeLocation: string
  batchNumber?: string
  expiryDate?: number
  lastUpdated: number
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expiring'
  department?: Department[]
  usageRatePerDay?: number
}

interface DepartmentUsage {
  id: string
  itemId: string
  itemName: string
  department: Department
  quantity: number
  usedBy: string
  purpose?: string
  cost: number
  timestamp: number
}

interface DepartmentUsageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: UnifiedInventoryItem
}

const departmentLabels: Record<Department, string> = {
  'front-office': 'Front Office',
  'housekeeping': 'Housekeeping',
  'fnb': 'F&B',
  'kitchen': 'Kitchen',
  'engineering': 'Engineering',
  'finance': 'Finance',
  'hr': 'HR',
  'admin': 'Admin',
}

export function DepartmentUsageDialog({
  open,
  onOpenChange,
  item,
}: DepartmentUsageDialogProps) {
  const [usages, setUsages] = useKV<DepartmentUsage[]>('w3-hotel-department-usage', [])
  const [department, setDepartment] = useState<Department>('housekeeping')
  const [quantity, setQuantity] = useState('')
  const [usedBy, setUsedBy] = useState('')
  const [purpose, setPurpose] = useState('')

  const itemUsages = (usages || [])
    .filter(u => u.itemId === item.id)
    .sort((a, b) => b.timestamp - a.timestamp)

  const currentMonth = useMemo(() => {
    const now = new Date()
    return itemUsages.filter(u => 
      isWithinInterval(u.timestamp, {
        start: startOfMonth(now),
        end: endOfMonth(now)
      })
    )
  }, [itemUsages])

  const departmentStats = useMemo(() => {
    const stats: Record<Department, { quantity: number; cost: number; count: number }> = {
      'front-office': { quantity: 0, cost: 0, count: 0 },
      'housekeeping': { quantity: 0, cost: 0, count: 0 },
      'fnb': { quantity: 0, cost: 0, count: 0 },
      'kitchen': { quantity: 0, cost: 0, count: 0 },
      'engineering': { quantity: 0, cost: 0, count: 0 },
      'finance': { quantity: 0, cost: 0, count: 0 },
      'hr': { quantity: 0, cost: 0, count: 0 },
      'admin': { quantity: 0, cost: 0, count: 0 },
    }

    currentMonth.forEach(usage => {
      stats[usage.department].quantity += usage.quantity
      stats[usage.department].cost += usage.cost
      stats[usage.department].count += 1
    })

    return stats
  }, [currentMonth])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    if (!usedBy) {
      toast.error('Please enter who used the item')
      return
    }

    const newUsage: DepartmentUsage = {
      id: `usage_${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      department,
      quantity: parseFloat(quantity),
      usedBy,
      purpose: purpose || undefined,
      cost: parseFloat(quantity) * item.unitCost,
      timestamp: Date.now(),
    }

    setUsages((current) => [...(current || []), newUsage])
    
    toast.success(`Usage recorded for ${departmentLabels[department]}`)
    
    setQuantity('')
    setUsedBy('')
    setPurpose('')
  }

  const totalThisMonth = currentMonth.reduce((sum, u) => sum + u.quantity, 0)
  const totalCostThisMonth = currentMonth.reduce((sum, u) => sum + u.cost, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Department Usage Report - {item.name}</DialogTitle>
          <DialogDescription>
            Track consumption by department for cost allocation and usage analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-semibold">{item.currentStock} {item.unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Used This Month</p>
              <p className="text-2xl font-semibold">{totalThisMonth.toFixed(2)} {item.unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost This Month</p>
              <p className="text-2xl font-semibold">{formatCurrency(totalCostThisMonth)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usage Rate</p>
              <p className="text-2xl font-semibold">
                {item.usageRatePerDay ? `${item.usageRatePerDay.toFixed(1)}/day` : 'N/A'}
              </p>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus size={20} />
              Record Department Usage
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={department} onValueChange={(value: Department) => setDepartment(value)}>
                  <SelectTrigger id="department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(item.department || Object.keys(departmentLabels) as Department[]).map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {departmentLabels[dept]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage-quantity">Quantity ({item.unit}) *</Label>
                <Input
                  id="usage-quantity"
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="used-by">Used By *</Label>
                <Input
                  id="used-by"
                  placeholder="Employee name or ID"
                  value={usedBy}
                  onChange={(e) => setUsedBy(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose/Notes</Label>
              <Input
                id="purpose"
                placeholder="Optional purpose or notes"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            {quantity && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <span className="text-muted-foreground">Estimated cost: </span>
                <span className="font-semibold">{formatCurrency(parseFloat(quantity || '0') * item.unitCost)}</span>
              </div>
            )}

            <Button type="submit" className="w-full">
              <Plus size={20} className="mr-2" />
              Record Usage
            </Button>
          </form>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ChartBar size={20} />
              Department Breakdown (This Month)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(departmentStats)
                .filter(([_, stats]) => stats.count > 0)
                .sort(([_, a], [__, b]) => b.quantity - a.quantity)
                .map(([dept, stats]) => (
                  <Card key={dept} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Users size={16} className="text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">{stats.count} uses</Badge>
                    </div>
                    <h4 className="text-sm font-medium mb-1">{departmentLabels[dept as Department]}</h4>
                    <p className="text-xl font-semibold">{stats.quantity.toFixed(1)} {item.unit}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatCurrency(stats.cost)}</p>
                  </Card>
                ))}
            </div>

            {Object.values(departmentStats).every(s => s.count === 0) && (
              <p className="text-center text-muted-foreground py-8">No usage recorded this month</p>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Usage History</h3>
            
            {itemUsages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No usage records yet</p>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead>Used By</TableHead>
                      <TableHead>Purpose</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemUsages.slice(0, 20).map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell className="text-sm">
                          {format(usage.timestamp, 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{departmentLabels[usage.department]}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {usage.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(usage.cost)}
                        </TableCell>
                        <TableCell className="text-sm">{usage.usedBy}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {usage.purpose || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {itemUsages.length > 20 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing latest 20 of {itemUsages.length} usage records
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
