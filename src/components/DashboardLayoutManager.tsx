import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
        isDefault: l.id === layoutId && l.userId === userId ? true : l.userId === userId ? false : l.isDefault
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
      isShared: false,
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
          </DialogHeader>

          <div className="dialog-body-scrollable">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Current Layout</h3>
                {currentLayout ? (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{currentLayout.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {currentLayout.widgets.length} widgets • {currentLayout.columns} columns
                        </p>
                      </div>
                      <Button onClick={handleSaveCurrentLayout} size="sm">
                        <Save size={16} className="mr-2" />
                        Save Layout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No layout loaded</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Quick Templates</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => handleCreateFromTemplate(1)}
                  >
                    <div className="w-full h-12 border-2 border-dashed rounded flex items-center justify-center">
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                    </div>
                    <span className="text-sm">1 Column</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => handleCreateFromTemplate(2)}
                  >
                    <div className="w-full h-12 border-2 border-dashed rounded flex items-center justify-center gap-1">
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                    </div>
                    <span className="text-sm">2 Columns</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => handleCreateFromTemplate(3)}
                  >
                    <div className="w-full h-12 border-2 border-dashed rounded flex items-center justify-center gap-1">
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                    </div>
                    <span className="text-sm">3 Columns</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => handleCreateFromTemplate(4)}
                  >
                    <div className="w-full h-12 border-2 border-dashed rounded flex items-center justify-center gap-1">
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                      <div className="w-full h-8 bg-primary/20 rounded-sm" />
                    </div>
                    <span className="text-sm">4 Columns</span>
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Saved Layouts</h3>
                {userLayouts.length === 0 ? (
                  <div className="p-8 border-2 border-dashed rounded-lg text-center">
                    <Layout size={48} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No saved layouts yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Save your current layout or create one from a template
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userLayouts.map(layout => (
                      <div
                        key={layout.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{layout.name}</p>
                              {layout.isDefault && layout.userId === userId && (
                                <Badge variant="default" className="shrink-0">
                                  <Star size={12} className="mr-1" weight="fill" />
                                  Default
                                </Badge>
                              )}
                              {layout.isShared && (
                                <Badge variant="secondary" className="shrink-0">
                                  <Share2 size={12} className="mr-1" />
                                  Shared
                                </Badge>
                              )}
                              {layout.userId !== userId && (
                                <Badge variant="outline" className="shrink-0 gap-1">
                                  {getRoleIcon(layout.userRole)}
                                  {layout.userRole}
                                </Badge>
                              )}
                            </div>
                            {layout.description && (
                              <p className="text-sm text-muted-foreground">{layout.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {layout.widgets.length} widgets • {layout.columns} columns
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoadLayout(layout)}
                            >
                              <Check size={16} className="mr-1" />
                              Load
                            </Button>
                            {layout.userId === userId && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreVertical size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!layout.isDefault && (
                                    <DropdownMenuItem onClick={() => handleSetDefault(layout.id)}>
                                      <Star size={16} className="mr-2" />
                                      Set as Default
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleEditLayout(layout)}>
                                    <Edit size={16} className="mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateLayout(layout)}>
                                    <Copy size={16} className="mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteLayout(layout.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash size={16} className="mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </div>
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
              {editingLayoutId ? 'Edit Layout' : 'Save Layout'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="layout-name">Layout Name</Label>
              <Input
                id="layout-name"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Enter layout name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout-description">Description (Optional)</Label>
              <Textarea
                id="layout-description"
                value={layoutDescription}
                onChange={(e) => setLayoutDescription(e.target.value)}
                placeholder="Enter layout description"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="layout-shared">Share with other users</Label>
              <Switch
                id="layout-shared"
                checked={isShared}
                onCheckedChange={setIsShared}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLayout}>
              <Save size={16} className="mr-2" />
              {editingLayoutId ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Layout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this layout? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLayout} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
