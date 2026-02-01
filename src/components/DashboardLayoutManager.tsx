import React, { useState } from 'react'
import { toast } from 'sonner'
import { toast } from 'sonner'
  Dialog
  DialogT
import {
  AlertDialogAc
  AlertDialogC
  AlertDialogFoo
  AlertDialogTitle,
import {
import { Label
import {
  SelectContent,
  SelectTrigger,
} from '@/components/ui/s
import {
  DropdownMenuConten
  DropdownMenuSepar
} from '@/components/ui/dropdown-menu
import {
  Plus,
  Copy,
  MoreVertical,
  Share2
  Check,
  Crown,
  Gauge
import type { Da

  userId: string
  currentLayout: DashboardLayout | null
  onClos

  userId,
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
    setShow
    setLayoutDes
  }
  const h
    toast.success(`Layout "${layo
    if (onClose) onClose()

    setSavedLayouts((layouts) =>
        ...l,
      }))
  

    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      userId,

      updatedAt: Date.now(),
    }
   

  const handleEditLayout = (layout: Dashb
    setLayoutName(layout.
    setIsShared(layout.isShared)
  }
  con


    if (!layoutToDele
    setSavedLayouts((layouts
    )
    if (currentLayout?.id ==
   


    setShowDeleteDialog(false
  }
  const hand
    c

      size: getWidgetSize
      isVisible: true,
    }))
    c

      name: `${columns}-Column Layout`,
      isShared: false,
      columns
      updatedAt
    }
    onLayoutChange(newLayout)
    setOpen(false)
  }
  const getRoleIcon = (role: UserRole
      case 'admin':
        return <Crown size={16} c
        return <Star size={16} className="text-accent" />
        return <Users
  }
  return (
      <Dialog open={open} onOpenChange={setOpen}>
          <Butto
     

        <DialogContent className="
            <DialogTitle className="flex items-center gap-2">
              Dashboard Layout Manage
      

              <div>
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

                    onClick={() => handleCreateFro
    setSavedLayouts((layouts) =>
                    </div>
        ...l,
                    variant="outline"
      }))
     
    toast.success('Default layout updated')
   

  const handleDuplicateLayout = (layout: DashboardLayout) => {
    const newLayout: DashboardLayout = {
                
      id: `layout-${Date.now()}`,
                    <span className=
      userId,
                    cla
                  >
      createdAt: Date.now(),
                      <div c
      createdBy: userId
    }

    setSavedLayouts((layouts) => [...(layouts || []), newLayout])
    toast.success('Layout duplicated successfully')
   

  const handleEditLayout = (layout: DashboardLayout) => {
    setEditingLayoutId(layout.id)
    setLayoutName(layout.name)
    setLayoutDescription(layout.description || '')
                      >
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
              />
      createdBy: userId
     

    onLayoutChange(newLayout)
    toast.success(`New ${columns}-column layout created`)
            <div c
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

















































































































































































































































