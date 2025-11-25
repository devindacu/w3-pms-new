import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MagnifyingGlass, Calendar } from '@phosphor-icons/react'
import { type SystemUser, type ActivityLog, type ActivityType } from '@/lib/types'
import {
  formatDateTime,
  getActivityTypeLabel,
  getActivityTypeColor,
  searchActivityLogs,
  filterActivityByType,
  filterActivityByUser
} from '@/lib/helpers'

interface ActivityLogsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SystemUser | null
  activityLogs: ActivityLog[]
}

export function ActivityLogsDialog({ open, onOpenChange, user, activityLogs }: ActivityLogsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all')

  const userLogs = user ? filterActivityByUser(activityLogs, user.id) : []
  
  const filteredLogs = userLogs
    .filter(log => {
      let matches = true
      
      if (searchTerm) {
        const searched = searchActivityLogs([log], searchTerm)
        matches = matches && searched.length > 0
      }
      
      if (typeFilter !== 'all') {
        const filtered = filterActivityByType([log], typeFilter)
        matches = matches && filtered.length > 0
      }
      
      return matches
    })
    .sort((a, b) => b.timestamp - a.timestamp)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity Logs - {user?.username}</DialogTitle>
          <DialogDescription>
            View all activities performed by this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ActivityType | 'all')}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="user-login">User Login</SelectItem>
                <SelectItem value="user-logout">User Logout</SelectItem>
                <SelectItem value="po-created">PO Created</SelectItem>
                <SelectItem value="po-approved">PO Approved</SelectItem>
                <SelectItem value="po-issued">PO Issued</SelectItem>
                <SelectItem value="requisition-created">Requisition Created</SelectItem>
                <SelectItem value="requisition-approved">Requisition Approved</SelectItem>
                <SelectItem value="requisition-rejected">Requisition Rejected</SelectItem>
                <SelectItem value="stock-received">Stock Received</SelectItem>
                <SelectItem value="stock-adjusted">Stock Adjusted</SelectItem>
                <SelectItem value="invoice-created">Invoice Created</SelectItem>
                <SelectItem value="payment-processed">Payment Processed</SelectItem>
                <SelectItem value="supplier-created">Supplier Created</SelectItem>
                <SelectItem value="supplier-updated">Supplier Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Resource</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className="text-sm">{formatDateTime(log.timestamp)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getActivityTypeColor(log.activityType)}>
                          {getActivityTypeLabel(log.activityType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{log.action}</span>
                      </TableCell>
                      <TableCell>
                        {log.details ? (
                          <span className="text-sm text-muted-foreground">{log.details}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.resource ? (
                          <div className="text-sm">
                            <div className="font-medium capitalize">{log.resource.replace('-', ' ')}</div>
                            {log.resourceId && (
                              <div className="text-xs text-muted-foreground">{log.resourceId}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} {filteredLogs.length === 1 ? 'activity' : 'activities'}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
