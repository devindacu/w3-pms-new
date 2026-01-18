import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Trash, 
  PencilSimple, 
  Archive, 
  CheckCircle, 
  XCircle, 
  Download, 
  Upload,
  X
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  batchDelete, 
  batchUpdate, 
  batchExport,
  showBatchOperationResult,
  type BatchOperationResult 
} from '@/lib/batch-operations'

export interface BatchAction {
  id: string
  label: string
  icon: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  action: 'delete' | 'update' | 'archive' | 'activate' | 'deactivate' | 'approve' | 'reject' | 'export' | 'custom'
  updates?: Record<string, any>
  confirmMessage?: string
  onExecute?: (selectedIds: string[]) => Promise<void> | void
}

interface BatchOperationsToolbarProps<T extends { id: string }> {
  items: T[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onItemsUpdate: (updatedItems: T[]) => void
  actions?: BatchAction[]
  entityName?: string
  showSelectAll?: boolean
  exportFields?: string[]
}

export function BatchOperationsToolbar<T extends { id: string }>({
  items,
  selectedIds,
  onSelectionChange,
  onItemsUpdate,
  actions = [],
  entityName = 'items',
  showSelectAll = true,
  exportFields,
}: BatchOperationsToolbarProps<T>) {
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedItems = items.filter(item => selectedIds.includes(item.id))
  const isAllSelected = items.length > 0 && selectedIds.length === items.length
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < items.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map(item => item.id))
    }
  }

  const handleDelete = async () => {
    setIsProcessing(true)
    try {
      const result = await batchDelete(
        selectedItems,
        (id) => {
          onItemsUpdate(items.filter(item => item.id !== id))
        },
        {
          confirmMessage: `Are you sure you want to delete ${selectedIds.length} ${entityName}? This action cannot be undone.`,
          onProgress: (processed, total) => {
            console.log(`Deleting: ${processed}/${total}`)
          }
        }
      )

      showBatchOperationResult(result, 'Delete')
      
      if (result.successful > 0) {
        onSelectionChange([])
      }
    } catch (error) {
      toast.error('Failed to delete items')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdate = async (updates: Record<string, any>) => {
    setIsProcessing(true)
    try {
      const result = await batchUpdate(
        selectedItems,
        (item, updateData) => {
          const updatedItems = items.map(i => 
            i.id === item.id ? { ...i, ...(updateData as any) } : i
          )
          onItemsUpdate(updatedItems)
        },
        updates as any,
        {
          onProgress: (processed, total) => {
            console.log(`Updating: ${processed}/${total}`)
          }
        }
      )

      showBatchOperationResult(result, 'Update')
      
      if (result.successful > 0) {
        onSelectionChange([])
      }
    } catch (error) {
      toast.error('Failed to update items')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = () => {
    batchExport(selectedItems, {
      format: 'csv',
      filename: `${entityName}-export-${Date.now()}`,
      selectedFields: exportFields,
    })
  }

  const handleAction = async (action: BatchAction) => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one item')
      return
    }

    setIsProcessing(true)
    
    try {
      switch (action.action) {
        case 'delete':
          await handleDelete()
          break
        
        case 'update':
          if (action.updates) {
            await handleUpdate(action.updates)
          }
          break
        
        case 'archive':
          await handleUpdate({ status: 'archived', archivedAt: Date.now() })
          break
        
        case 'activate':
          await handleUpdate({ status: 'active', isActive: true })
          break
        
        case 'deactivate':
          await handleUpdate({ status: 'inactive', isActive: false })
          break
        
        case 'approve':
          await handleUpdate({ status: 'approved', approvedAt: Date.now() })
          break
        
        case 'reject':
          await handleUpdate({ status: 'rejected', rejectedAt: Date.now() })
          break
        
        case 'export':
          handleExport()
          break
        
        case 'custom':
          if (action.onExecute) {
            await action.onExecute(selectedIds)
            onSelectionChange([])
          }
          break
      }
    } catch (error) {
      toast.error(`Failed to execute ${action.label}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const defaultActions: BatchAction[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash size={16} />,
      variant: 'destructive',
      action: 'delete',
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download size={16} />,
      variant: 'outline',
      action: 'export',
    },
  ]

  const allActions = actions.length > 0 ? actions : defaultActions

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-50 bg-card border-t shadow-lg animate-slide-in">
      <div className="px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm font-semibold">
            {selectedIds.length} selected
          </Badge>
          
          {showSelectAll && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isSomeSelected ? 'data-[state=checked]:bg-primary/50' : ''}
              />
              <span className="text-sm text-muted-foreground">
                Select all {items.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 flex-wrap">
          {allActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'default'}
              size="sm"
              onClick={() => handleAction(action)}
              disabled={isProcessing}
              className="gap-2"
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
            disabled={isProcessing}
          >
            <X size={16} />
            <span className="hidden sm:inline ml-2">Clear</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
