import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { type SystemUser, type UserPermission, type PermissionResource, type PermissionAction, type ActivityLog } from '@/lib/types'
import { getRolePermissions, createActivityLog } from '@/lib/helpers'

interface UserPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SystemUser | null
  setUsers: (users: SystemUser[] | ((prev: SystemUser[]) => SystemUser[])) => void
  currentUser: SystemUser
  activityLogs: ActivityLog[]
  setActivityLogs: (logs: ActivityLog[] | ((prev: ActivityLog[]) => ActivityLog[])) => void
}

const RESOURCES: { value: PermissionResource; label: string }[] = [
  { value: 'users', label: 'Users' },
  { value: 'suppliers', label: 'Suppliers' },
  { value: 'food-items', label: 'Food Items' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'construction-materials', label: 'Construction Materials' },
  { value: 'general-products', label: 'General Products' },
  { value: 'purchase-orders', label: 'Purchase Orders' },
  { value: 'requisitions', label: 'Requisitions' },
  { value: 'stock', label: 'Stock Management' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'projects', label: 'Projects' },
  { value: 'reports', label: 'Reports' },
  { value: 'system-settings', label: 'System Settings' }
]

const ACTIONS: { value: PermissionAction; label: string }[] = [
  { value: 'read', label: 'Read' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'approve', label: 'Approve' },
  { value: 'issue', label: 'Issue' },
  { value: 'receive', label: 'Receive' },
  { value: 'manage', label: 'Manage' }
]

export function UserPermissionsDialog({ open, onOpenChange, user, setUsers, currentUser, activityLogs, setActivityLogs }: UserPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<UserPermission[]>([])

  useEffect(() => {
    if (user) {
      setPermissions([...user.permissions])
    }
  }, [user, open])

  const handleResetToRoleDefaults = () => {
    if (!user) return
    const rolePermissions = getRolePermissions(user.role)
    setPermissions([...rolePermissions])
    toast.success('Permissions reset to role defaults')
  }

  const toggleAction = (resource: PermissionResource, action: PermissionAction) => {
    setPermissions(prev => {
      const resourcePermission = prev.find(p => p.resource === resource)
      
      if (!resourcePermission) {
        return [...prev, { resource, actions: [action] }]
      }
      
      const hasAction = resourcePermission.actions.includes(action)
      
      if (hasAction) {
        const newActions = resourcePermission.actions.filter(a => a !== action)
        if (newActions.length === 0) {
          return prev.filter(p => p.resource !== resource)
        }
        return prev.map(p => p.resource === resource ? { ...p, actions: newActions } : p)
      } else {
        return prev.map(p => p.resource === resource ? { ...p, actions: [...p.actions, action] } : p)
      }
    })
  }

  const hasAction = (resource: PermissionResource, action: PermissionAction): boolean => {
    const resourcePermission = permissions.find(p => p.resource === resource)
    return resourcePermission ? resourcePermission.actions.includes(action) : false
  }

  const handleSubmit = () => {
    if (!user) return

    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, permissions, updatedAt: Date.now() }
        : u
    ))

    const log = createActivityLog(
      currentUser,
      'user-updated',
      `Updated permissions for ${user.username}`,
      'Modified user permissions',
      'users',
      user.id
    )
    setActivityLogs(prev => [log, ...prev])

    toast.success('Permissions updated successfully')
    onOpenChange(false)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions - {user.username}</DialogTitle>
          <DialogDescription>
            Configure detailed permissions for this user. Current role: <Badge className="ml-2">{user.role}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Select the actions this user can perform on each resource
            </p>
            <Button type="button" variant="outline" size="sm" onClick={handleResetToRoleDefaults}>
              Reset to Role Defaults
            </Button>
          </div>

          <div className="space-y-3">
            {RESOURCES.map((resource) => {
              const resourcePermission = permissions.find(p => p.resource === resource.value)
              const hasAnyPermission = resourcePermission && resourcePermission.actions.length > 0

              return (
                <Card key={resource.value} className={`p-4 ${hasAnyPermission ? 'border-primary' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">{resource.label}</Label>
                      {hasAnyPermission && (
                        <Badge variant="secondary" className="text-xs">
                          {resourcePermission.actions.length} {resourcePermission.actions.length === 1 ? 'permission' : 'permissions'}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {ACTIONS.map((action) => (
                        <div key={action.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${resource.value}-${action.value}`}
                            checked={hasAction(resource.value, action.value)}
                            onCheckedChange={() => toggleAction(resource.value, action.value)}
                          />
                          <label
                            htmlFor={`${resource.value}-${action.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {action.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
