import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import {
  Layout,
  Plus,
  Save,
  Copy,
  Trash,
  MoreVertical,
  Star,
  Share2,
  Edit,
  Check,
  Sparkle,
  Crown,
  Users,
  Gauge
} from '@phosphor-icons/react'
import type { DashboardLayout, SystemUser, UserRole, SystemRole } from '@/lib/types'
import { getDefaultWidgetsForRole, getWidgetSize } from '@/lib/widgetConfig'

interface DashboardLayoutManagerProps {
  userId: string
  userRole: UserRole | SystemRole
  currentLayout: DashboardLayout | null
  onLayoutChange: (layout: DashboardLayout) => void
  onClose?: () => void
}

export function DashboardLayoutManager({
  userId,
  userRole,
  currentLayout,
  onLayoutChange,
  onClose
}: DashboardLayoutManagerProps) {
  const [savedLayouts, setSavedLayouts] = useKV<DashboardLayout[]>('w3-hotel-dashboard-layouts', [])
  const [open, setOpen] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [layoutToDelete, setLayoutToDelete] = useState<string | null>(null)
  
  const [layoutName, setLayoutName] = useState('')
  const [layoutDescription, setLayoutDescription] = useState('')
  const [isShared, setIsShared] = useState(false)
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null)

  const userLayouts = (savedLayouts || []).filter(
    layout => layout.userId === userId || layout.isShared
  )

  const handleSaveCurrentLayout = () => {
    if (!currentLayout) {
      toast.error('No layout to save')
      return
    }

    setShowSaveDialog(true)
    setLayoutName('')
    setLayoutDescription('')
    setIsShared(false)
    setEditingLayoutId(null)
  }

  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      toast.error('Please enter a layout name')
      return
    }

    if (!currentLayout) {
      toast.error('No layout to save')
      return
    }

    const newLayout: DashboardLayout = {
      id: editingLayoutId || `layout-${Date.now()}`,
      userId,
      userRole,
      name: layoutName,
      description: layoutDescription || undefined,
      isDefault: false,
      isShared,
      widgets: currentLayout.widgets,
      columns: currentLayout.columns,
      createdAt: editingLayoutId 
        ? savedLayouts?.find(l => l.id === editingLayoutId)?.createdAt || Date.now()
        : Date.now(),
      updatedAt: Date.now(),
      createdBy: editingLayoutId
        ? savedLayouts?.find(l => l.id === editingLayoutId)?.createdBy || userId
        : userId
    }

    setSavedLayouts((layouts) => {
      const filtered = (layouts || []).filter(l => l.id !== newLayout.id)
      return [...filtered, newLayout]
    })

    toast.success(editingLayoutId ? 'Layout updated successfully' : 'Layout saved successfully')
    setShowSaveDialog(false)
    setLayoutName('')
    setLayoutDescription('')
    setEditingLayoutId(null)
  }

  const handleLoadLayout = (layout: DashboardLayout) => {
    onLayoutChange(layout)
    toast.success(`Layout "${layout.name}" loaded`)
    setOpen(false)
    if (onClose) onClose()
  }

  const handleSetDefault = (layoutId: string) => {
    setSavedLayouts((layouts) =>
      (layouts || []).map(l => ({
        ...l,
        isDefault: l.id === layoutId && l.userId === userId
      }))
    )
    toast.success('Default layout updated')
  }

  const handleDuplicateLayout = (layout: DashboardLayout) => {
    const newLayout: DashboardLayout = {
      ...layout,
      id: `layout-${Date.now()}`,
      name: `${layout.name} (Copy)`,
      userId,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: userId
    }

    setSavedLayouts((layouts) => [...(layouts || []), newLayout])
    toast.success('Layout duplicated successfully')
  }

  const handleEditLayout = (layout: DashboardLayout) => {
    setEditingLayoutId(layout.id)
    setLayoutName(layout.name)
    setLayoutDescription(layout.description || '')
    setIsShared(layout.isShared)
    setShowSaveDialog(true)
  }

  const handleDeleteLayout = (layoutId: string) => {
    setLayoutToDelete(layoutId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteLayout = () => {
    if (!layoutToDelete) return

    setSavedLayouts((layouts) =>
      (layouts || []).filter(l => l.id !== layoutToDelete)
    )

    if (currentLayout?.id === layoutToDelete) {
      const defaultLayout = userLayouts.find(l => l.isDefault && l.userId === userId)
      if (defaultLayout) {
        onLayoutChange(defaultLayout)
      }
    }

    toast.success('Layout deleted successfully')
    setShowDeleteDialog(false)
    setLayoutToDelete(null)
  }

  const handleCreateFromTemplate = (columns: 1 | 2 | 3 | 4) => {
    const defaultWidgets = getDefaultWidgetsForRole(userRole) || []
    const widgets = defaultWidgets.map((type, index) => ({
      id: `widget-${Date.now()}-${index}`,
      type,
      title: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      size: getWidgetSize(userRole, type),
      position: index,
      isVisible: true,
      refreshInterval: 60000,
    }))

    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      userId,
      userRole,
      name: `${columns}-Column Layout`,
      isDefault: false,
      isShared: false,
      widgets,
      columns,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: userId
    }

    onLayoutChange(newLayout)
    toast.success(`New ${columns}-column layout created`)
    setOpen(false)
    if (onClose) onClose()
  }

  const getRoleIcon = (role: UserRole | SystemRole) => {
    switch (role) {
      case 'admin':
      case 'owner':
        return <Crown size={16} className="text-primary" />
      case 'manager':
        return <Star size={16} className="text-accent" />
      default:
        return <Users size={16} className="text-muted-foreground" />
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg">
            <Layout size={20} className="mr-2" />
            <span className="hidden sm:inline">Manage Layouts</span>
            <span className="sm:hidden">Layouts</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout size={24} />
              Dashboard Layout Manager
            </DialogTitle>
            <DialogDescription>
              Save, load, and manage your personalized dashboard layouts
            </DialogDescription>
          </DialogHeader>

          <div className="dialog-body-scrollable">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Quick Templates</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => handleCreateFromTemplate(1)}
                  >
                    <Gauge size={24} />
                    <span className="text-sm">1 Column</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => handleCreateFromTemplate(2)}
                  >
                    <Gauge size={24} />
                    <span className="text-sm">2 Columns</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => handleCreateFromTemplate(3)}
                  >
                    <Gauge size={24} />
                    <span className="text-sm">3 Columns</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => handleCreateFromTemplate(4)}
                  >
                    <Gauge size={24} />
                    <span className="text-sm">4 Columns</span>
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Saved Layouts</h3>
                  <Button onClick={handleSaveCurrentLayout} size="sm">
                    <Save size={16} className="mr-2" />
                    Save Current
                  </Button>
                </div>

                {userLayouts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Layout size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No saved layouts yet. Save your current layout or create a new one from templates.
                    </p>
                    <Button onClick={handleSaveCurrentLayout} variant="outline">
                      <Save size={16} className="mr-2" />
                      Save Current Layout
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {userLayouts.map((layout) => (
                      <Card
                        key={layout.id}
                        className={`p-4 transition-all hover:border-primary ${
                          currentLayout?.id === layout.id ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold truncate">{layout.name}</h4>
                              {layout.isDefault && (
                                <Badge variant="secondary" className="shrink-0">
                                  <Star size={12} className="mr-1" weight="fill" />
                                  Default
                                </Badge>
                              )}
                              {layout.isShared && (
                                <Badge variant="outline" className="shrink-0">
                                  <Share2 size={12} className="mr-1" />
                                  Shared
                                </Badge>
                              )}
                              {currentLayout?.id === layout.id && (
                                <Badge className="shrink-0">
                                  <Check size={12} className="mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            {layout.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {layout.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Layout size={14} />
                                {layout.columns} columns
                              </span>
                              <span className="flex items-center gap-1">
                                <Sparkle size={14} />
                                {layout.widgets.length} widgets
                              </span>
                              <span className="flex items-center gap-1">
                                {getRoleIcon(layout.userRole || userRole)}
                                {layout.userRole || userRole}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleLoadLayout(layout)}
                              disabled={currentLayout?.id === layout.id}
                            >
                              Load
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {layout.userId === userId && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleEditLayout(layout)}>
                                      <Edit size={16} className="mr-2" />
                                      Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSetDefault(layout.id)}>
                                      <Star size={16} className="mr-2" />
                                      {layout.isDefault ? 'Unset Default' : 'Set as Default'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => handleDuplicateLayout(layout)}>
                                  <Copy size={16} className="mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                {layout.userId === userId && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteLayout(layout.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash size={16} className="mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLayoutId ? 'Edit Layout Details' : 'Save Dashboard Layout'}
            </DialogTitle>
            <DialogDescription>
              {editingLayoutId 
                ? 'Update the details for this layout'
                : 'Save your current dashboard configuration for easy access later'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="layout-name">Layout Name *</Label>
              <Input
                id="layout-name"
                placeholder="e.g., My Morning Dashboard"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="layout-description">Description (Optional)</Label>
              <Textarea
                id="layout-description"
                placeholder="Brief description of this layout..."
                value={layoutDescription}
                onChange={(e) => setLayoutDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="shared-layout">Share with team</Label>
                <p className="text-xs text-muted-foreground">
                  Allow other users to view and use this layout
                </p>
              </div>
              <Switch
                id="shared-layout"
                checked={isShared}
                onCheckedChange={setIsShared}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLayout}>
              <Save size={16} className="mr-2" />
              {editingLayoutId ? 'Update' : 'Save'} Layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Layout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this layout? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLayout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
