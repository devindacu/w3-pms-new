import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Brain, Sparkle, CheckSquare, Square } from '@phosphor-icons/react'

interface UserPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SystemUser | null
  setUsers: (users: SystemUser[] | ((prev: SystemUser[]) => SystemUser[])) => void
  currentUser: SystemUser
  activityLogs: ActivityLog[]
  setActivityLogs: (logs: ActivityLog[] | ((prev: ActivityLog[]) => ActivityLog[])) => void
}

// Module-based resource groups shown in the permission table
const MODULE_GROUPS: Array<{
  group: string
  color: string
  resources: Array<{ value: PermissionResource; label: string }>
}> = [
  {
    group: '🏨 Front Office & Reservations',
    color: 'border-l-blue-500',
    resources: [
      { value: 'reservations', label: 'Reservation Management' },
      { value: 'booking-calendar', label: 'Booking Calendar' },
      { value: 'channel-manager', label: 'Channel Manager' },
      { value: 'crm', label: 'CRM (Guest Profiles)' },
      { value: 'availability-rates', label: 'Availability & Rates' },
    ],
  },
  {
    group: '💰 Finance & Billing',
    color: 'border-l-green-500',
    resources: [
      { value: 'invoices', label: 'Invoices' },
      { value: 'payments', label: 'Payments' },
    ],
  },
  {
    group: '🏪 Procurement & Inventory',
    color: 'border-l-amber-500',
    resources: [
      { value: 'suppliers', label: 'Suppliers' },
      { value: 'purchase-orders', label: 'Purchase Orders' },
      { value: 'requisitions', label: 'Requisitions' },
      { value: 'stock', label: 'Stock Management' },
      { value: 'food-items', label: 'Food Items' },
      { value: 'amenities', label: 'Amenities' },
      { value: 'construction-materials', label: 'Construction Materials' },
      { value: 'general-products', label: 'General Products' },
    ],
  },
  {
    group: '📊 Reports & Projects',
    color: 'border-l-violet-500',
    resources: [
      { value: 'reports', label: 'Reports' },
      { value: 'projects', label: 'Projects' },
    ],
  },
  {
    group: '⚙️ Administration',
    color: 'border-l-red-500',
    resources: [
      { value: 'users', label: 'User Management' },
      { value: 'system-settings', label: 'System Settings' },
    ],
  },
]

// The 4 standard CRUD actions shown in the table header
const TABLE_ACTIONS: Array<{ value: PermissionAction; label: string }> = [
  { value: 'read', label: 'View' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Edit' },
  { value: 'delete', label: 'Delete' },
]

// Extra actions beyond the standard 4
const EXTRA_ACTIONS: Array<{ value: PermissionAction; label: string }> = [
  { value: 'approve', label: 'Approve' },
  { value: 'issue', label: 'Issue' },
  { value: 'receive', label: 'Receive' },
  { value: 'manage', label: 'Manage' },
]

// AI permission suggestion templates keyed by role
const AI_ROLE_SUGGESTIONS: Record<string, { description: string; resources: PermissionResource[]; actions: PermissionAction[] }> = {
  reservation: {
    description: 'Reservation role detected → apply booking + CRM permissions?',
    resources: ['reservations', 'booking-calendar', 'channel-manager', 'crm', 'availability-rates', 'reports'],
    actions: ['read', 'create', 'update'],
  },
  admin: {
    description: 'Administrator role → grant full access to all modules?',
    resources: ['reservations', 'booking-calendar', 'channel-manager', 'crm', 'availability-rates', 'invoices', 'payments', 'reports', 'users'],
    actions: ['read', 'create', 'update', 'delete', 'manage'],
  },
  accounts: {
    description: 'Accounts role → grant finance and reporting access?',
    resources: ['invoices', 'payments', 'reports', 'suppliers'],
    actions: ['read', 'create', 'update'],
  },
}

function getAccessLevel(resource: PermissionResource, permissions: UserPermission[]): 'full' | 'partial' | 'none' {
  const perm = permissions.find(p => p.resource === resource)
  if (!perm || perm.actions.length === 0) return 'none'
  const totalActions = TABLE_ACTIONS.length + EXTRA_ACTIONS.length
  if (perm.actions.length >= totalActions) return 'full'
  return 'partial'
}

export function UserPermissionsDialog({
  open,
  onOpenChange,
  user,
  setUsers,
  currentUser,
  activityLogs,
  setActivityLogs,
}: UserPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [aiSuggestion, setAiSuggestion] = useState<typeof AI_ROLE_SUGGESTIONS[string] | null>(null)

  useEffect(() => {
    if (user) {
      setPermissions([...user.permissions])
      // Show AI suggestion if role has a suggestion template
      const suggestion = AI_ROLE_SUGGESTIONS[user.role]
      setAiSuggestion(suggestion || null)
    }
  }, [user, open])

  const hasAction = (resource: PermissionResource, action: PermissionAction): boolean => {
    const perm = permissions.find(p => p.resource === resource)
    return perm ? perm.actions.includes(action) : false
  }

  const toggleAction = (resource: PermissionResource, action: PermissionAction) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.resource === resource)
      if (!existing) {
        return [...prev, { resource, actions: [action] }]
      }
      const hasIt = existing.actions.includes(action)
      const newActions = hasIt
        ? existing.actions.filter(a => a !== action)
        : [...existing.actions, action]
      if (newActions.length === 0) return prev.filter(p => p.resource !== resource)
      return prev.map(p => p.resource === resource ? { ...p, actions: newActions } : p)
    })
  }

  const toggleAllActionsForResource = (resource: PermissionResource) => {
    const allActions = [...TABLE_ACTIONS.map(a => a.value), ...EXTRA_ACTIONS.map(a => a.value)]
    const perm = permissions.find(p => p.resource === resource)
    const allChecked = perm && allActions.every(a => perm.actions.includes(a))

    setPermissions(prev => {
      if (allChecked) {
        return prev.filter(p => p.resource !== resource)
      }
      const existing = prev.find(p => p.resource === resource)
      if (existing) {
        return prev.map(p => p.resource === resource ? { ...p, actions: allActions } : p)
      }
      return [...prev, { resource, actions: allActions }]
    })
  }

  const isResourceFullySelected = (resource: PermissionResource): boolean => {
    const allActions = [...TABLE_ACTIONS.map(a => a.value), ...EXTRA_ACTIONS.map(a => a.value)]
    const perm = permissions.find(p => p.resource === resource)
    return !!perm && allActions.every(a => perm.actions.includes(a))
  }

  const toggleAllInGroup = (resources: PermissionResource[], selectAll: boolean) => {
    const allActions = [...TABLE_ACTIONS.map(a => a.value), ...EXTRA_ACTIONS.map(a => a.value)]
    setPermissions(prev => {
      let updated = [...prev]
      for (const resource of resources) {
        updated = updated.filter(p => p.resource !== resource)
        if (selectAll) {
          updated.push({ resource, actions: allActions })
        }
      }
      return updated
    })
  }

  const isGroupFullySelected = (resources: PermissionResource[]): boolean => {
    return resources.every(r => isResourceFullySelected(r))
  }

  const handleSelectAll = () => {
    const allResources = MODULE_GROUPS.flatMap(g => g.resources.map(r => r.value))
    const allActions = [...TABLE_ACTIONS.map(a => a.value), ...EXTRA_ACTIONS.map(a => a.value)]
    const allSelected = allResources.every(r => isResourceFullySelected(r))
    if (allSelected) {
      setPermissions([])
    } else {
      setPermissions(allResources.map(resource => ({ resource, actions: allActions })))
    }
  }

  const allSelected = MODULE_GROUPS.flatMap(g => g.resources.map(r => r.value)).every(r => isResourceFullySelected(r))

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion) return
    setPermissions(prev => {
      let updated = [...prev]
      for (const resource of aiSuggestion.resources) {
        const existing = updated.find(p => p.resource === resource)
        if (existing) {
          const merged = Array.from(new Set([...existing.actions, ...aiSuggestion.actions]))
          updated = updated.map(p => p.resource === resource ? { ...p, actions: merged } : p)
        } else {
          updated.push({ resource, actions: [...aiSuggestion.actions] })
        }
      }
      return updated
    })
    setAiSuggestion(null)
    toast.success('AI permission suggestion applied')
  }

  const handleResetToRoleDefaults = () => {
    if (!user) return
    setPermissions([...getRolePermissions(user.role)])
    toast.success('Permissions reset to role defaults')
  }

  const handleSubmit = () => {
    if (!user) return
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, permissions, updatedAt: Date.now() } : u
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

  const accessColor = {
    full: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
    partial: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
    none: 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/10 dark:text-red-400',
  }

  const accessLabel = { full: '● Full', partial: '◑ Partial', none: '○ Restricted' }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Manage Permissions
            <Badge variant="secondary">{user.username}</Badge>
          </DialogTitle>
          <DialogDescription>
            Configure module-level permissions. Role: <Badge className="ml-1 text-xs">{user.role}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* AI Suggestion Banner */}
          {aiSuggestion && (
            <Alert className="bg-violet-50 border-violet-200 dark:bg-violet-950/20">
              <Brain size={16} className="text-violet-500" />
              <AlertDescription className="flex items-center justify-between gap-3">
                <span className="text-sm text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                  <Sparkle size={14} />
                  <strong>AI Suggestion:</strong> {aiSuggestion.description}
                </span>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-violet-300" onClick={handleApplyAiSuggestion}>
                    Apply
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAiSuggestion(null)}>
                    Dismiss
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Legend */}
          <div className="flex items-center flex-wrap gap-3 text-xs">
            <span className="font-medium text-muted-foreground">Access Level:</span>
            {(['full', 'partial', 'none'] as const).map(level => (
              <span key={level} className={`px-2 py-0.5 rounded border text-xs ${accessColor[level]}`}>
                {accessLabel[level]}
              </span>
            ))}
          </div>

          {/* Global Select All + Reset */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant={allSelected ? 'default' : 'outline'}
              size="sm"
              onClick={handleSelectAll}
              className="gap-1.5"
            >
              {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
              {allSelected ? 'Deselect All' : 'Select All Permissions'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleResetToRoleDefaults}>
              Reset to Role Defaults
            </Button>
          </div>

          {/* Module Groups */}
          {MODULE_GROUPS.map(({ group, color, resources }) => {
            const groupAllSelected = isGroupFullySelected(resources.map(r => r.value))
            return (
              <Card key={group} className={`p-4 border-l-4 ${color}`}>
                <div className="space-y-3">
                  {/* Group Header */}
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">{group}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => toggleAllInGroup(resources.map(r => r.value), !groupAllSelected)}
                    >
                      {groupAllSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                      {groupAllSelected ? 'Deselect Group' : 'Select Group'}
                    </Button>
                  </div>

                  {/* Permission Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1 pr-4 font-medium text-muted-foreground w-48">Module</th>
                          <th className="text-center px-2 font-medium text-muted-foreground w-8">All</th>
                          {TABLE_ACTIONS.map(a => (
                            <th key={a.value} className="text-center px-2 font-medium text-muted-foreground">{a.label}</th>
                          ))}
                          {EXTRA_ACTIONS.map(a => (
                            <th key={a.value} className="text-center px-2 font-medium text-muted-foreground text-xs">{a.label}</th>
                          ))}
                          <th className="text-center px-2 font-medium text-muted-foreground text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map(({ value: resource, label }) => {
                          const level = getAccessLevel(resource, permissions)
                          return (
                            <tr key={resource} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="py-2 pr-4 font-medium text-sm">{label}</td>
                              {/* Select All for this row */}
                              <td className="text-center px-2">
                                <Checkbox
                                  checked={isResourceFullySelected(resource)}
                                  onCheckedChange={() => toggleAllActionsForResource(resource)}
                                  className="mx-auto"
                                />
                              </td>
                              {/* Standard CRUD actions */}
                              {TABLE_ACTIONS.map(action => (
                                <td key={action.value} className="text-center px-2">
                                  <Checkbox
                                    id={`${resource}-${action.value}`}
                                    checked={hasAction(resource, action.value)}
                                    onCheckedChange={() => toggleAction(resource, action.value)}
                                    className="mx-auto"
                                  />
                                </td>
                              ))}
                              {/* Extra actions */}
                              {EXTRA_ACTIONS.map(action => (
                                <td key={action.value} className="text-center px-2">
                                  <Checkbox
                                    checked={hasAction(resource, action.value)}
                                    onCheckedChange={() => toggleAction(resource, action.value)}
                                    className="mx-auto"
                                  />
                                </td>
                              ))}
                              {/* Access level indicator */}
                              <td className="text-center px-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${accessColor[level]}`}>
                                  {accessLabel[level]}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            )
          })}
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
