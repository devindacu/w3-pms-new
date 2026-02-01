import React, { useState } from 'react'
import { toast } from 'sonner'
  Dialog,
import {
  DialogH
  DialogTrigger,
import { Button } fr
import { Label 
import {
  SelectConten
  SelectTrigger,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
import {
  Select,
  SelectContent,
  SelectItem,
  AlertDialogTit
import { Switc
  Layout,
  Save,
  Trash,
  Star,
  Edit,
  Sparkle,
  Users,
} from '@phosphor-icons/
import { getDefaultWid
interface DashboardLayoutManagerProps 
  userRo
  onLayoutChan
}
export function Dash
  userRole,
  onLayoutChange,
}: DashboardLayoutMa
  const [open, setOp
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
   

  const handleSaveCurrentLayout = () => {
    if (!currentLayout) {
      toast.error('No layout to save')
      return
    s

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
     

    if (!currentLayout) {
      toast.error('No layout to save')
      return
    }

    const newLayout: DashboardLayout = {
      id: editingLayoutId || `layout-${Date.now()}`,
    toast.suc
      userRole,
  const handleEditLayou
      description: layoutDescription || undefined,
      isDefault: false,
      isShared,
  }
      columns: currentLayout.columns,
      createdAt: editingLayoutId 
        ? savedLayouts?.find(l => l.id === editingLayoutId)?.createdAt || Date.now()

      updatedAt: Date.now(),

        ? savedLayouts?.find(l => l.id === editingLayoutId)?.createdBy || userId
    )
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
   

  const handleLoadLayout = (layout: DashboardLayout) => {
    onLayoutChange(layout)
    toast.success(`Layout "${layout.name}" loaded`)
    setOpen(false)
    if (onClose) onClose()
  }

      widgets,
    setSavedLayouts((layouts) =>
      updatedAt: Date.now(),
        ...l,

      }))
    s
    toast.success('Default layout updated')


  const handleDuplicateLayout = (layout: DashboardLayout) => {
    const newLayout: DashboardLayout = {
      case 'mana
      id: `layout-${Date.now()}`,
        return <Users size={16} clas
      userId,

      createdAt: Date.now(),
      <Dialog open={open} on
      createdBy: userId
    }

    setSavedLayouts((layouts) => [...(layouts || []), newLayout])
    toast.success('Layout duplicated successfully')
   

  const handleEditLayout = (layout: DashboardLayout) => {
    setEditingLayoutId(layout.id)
    setLayoutName(layout.name)
    setLayoutDescription(layout.description || '')

    setShowSaveDialog(true)
   

  const handleDeleteLayout = (layoutId: string) => {
    setLayoutToDelete(layoutId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteLayout = () => {
    if (!layoutToDelete) return

    setSavedLayouts((layouts) =>
      (layouts || []).filter(l => l.id !== layoutToDelete)
     

    if (currentLayout?.id === layoutToDelete) {
      const defaultLayout = userLayouts.find(l => l.isDefault && l.userId === userId)
      if (defaultLayout) {
        onLayoutChange(defaultLayout)
       
    }

    toast.success('Layout deleted successfully')
    setShowDeleteDialog(false)
    setLayoutToDelete(null)
   

  const handleCreateFromTemplate = (columns: 1 | 2 | 3 | 4) => {
    const defaultWidgets = getDefaultWidgetsForRole(userRole) || []
    const widgets = defaultWidgets.map((type, index) => ({
      id: `widget-${Date.now()}-${index}`,
           
      title: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      size: getWidgetSize(userRole, type),
      position: index,
      isVisible: true,
      refreshInterval: 60000,
       

    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      userId,
      userRole,
      name: `${columns}-Column Layout`,
      isDefault: false,
      isShared: false,
      widgets,
              
      createdAt: Date.now(),
                            
      createdBy: userId
     

    onLayoutChange(newLayout)
    toast.success(`New ${columns}-column layout created`)
                  
    if (onClose) onClose()
   

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
   

          
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg">
            <Layout size={20} className="mr-2" />
                            <Button
            <span className="sm:hidden">Layouts</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout size={24} />
              Dashboard Layout Manager
            </DialogTitle>
                               
              Save, load, and manage your personalized dashboard layouts
                                
          </DialogHeader>

          <div className="dialog-body-scrollable">
            <div className="space-y-6">
              <div>
































































































































































































































































