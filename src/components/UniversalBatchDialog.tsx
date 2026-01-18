import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  PencilSimple, 
  Trash, 
  CheckCircle,
  Warning 
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export interface BatchField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'textarea'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
}

interface UniversalBatchDialogProps<T extends { id: string }> {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItems: T[]
  fields: BatchField[]
  entityName: string
  onUpdate: (updates: Record<string, any>) => Promise<void>
  onDelete?: () => Promise<void>
  showDelete?: boolean
}

export function UniversalBatchDialog<T extends { id: string }>({
  open,
  onOpenChange,
  selectedItems,
  fields,
  entityName,
  onUpdate,
  onDelete,
  showDelete = true,
}: UniversalBatchDialogProps<T>) {
  const [updates, setUpdates] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTab, setCurrentTab] = useState<'update' | 'delete'>('update')

  const handleFieldChange = (key: string, value: any) => {
    setUpdates(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleUpdate = async () => {
    if (Object.keys(updates).length === 0) {
      toast.error('Please select at least one field to update')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to update ${selectedItems.length} ${entityName}?`
    )

    if (!confirmed) return

    setIsProcessing(true)
    setProgress(0)

    try {
      await onUpdate(updates)
      
      setProgress(100)
      toast.success(`Successfully updated ${selectedItems.length} ${entityName}`)
      
      setTimeout(() => {
        onOpenChange(false)
        setUpdates({})
        setProgress(0)
      }, 500)
    } catch (error) {
      toast.error('Failed to update items')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} ${entityName}? This action cannot be undone.`
    )

    if (!confirmed) return

    setIsProcessing(true)
    setProgress(0)

    try {
      await onDelete()
      
      setProgress(100)
      toast.success(`Successfully deleted ${selectedItems.length} ${entityName}`)
      
      setTimeout(() => {
        onOpenChange(false)
        setProgress(0)
      }, 500)
    } catch (error) {
      toast.error('Failed to delete items')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderField = (field: BatchField) => {
    const value = updates[field.key]

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.key}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={isProcessing}
            className="dialog-form-input"
          />
        )

      case 'number':
        return (
          <Input
            id={field.key}
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value))}
            placeholder={field.placeholder}
            disabled={isProcessing}
            className="dialog-form-input"
          />
        )

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => handleFieldChange(field.key, val)}
            disabled={isProcessing}
          >
            <SelectTrigger className="dialog-form-input">
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.key}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
              disabled={isProcessing}
            />
            <Label htmlFor={field.key} className="cursor-pointer">
              {value ? 'Yes' : 'No'}
            </Label>
          </div>
        )

      case 'date':
        return (
          <Input
            id={field.key}
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            disabled={isProcessing}
            className="dialog-form-input"
          />
        )

      case 'textarea':
        return (
          <Textarea
            id={field.key}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={isProcessing}
            className="dialog-form-textarea"
            rows={3}
          />
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="dialog-header-fixed px-4 sm:px-6">
          <DialogTitle className="flex items-center gap-2">
            <PencilSimple size={20} className="text-primary" />
            Batch Operations - {selectedItems.length} {entityName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'update' | 'delete')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 sm:mx-6 grid w-auto grid-cols-2">
            <TabsTrigger value="update" className="gap-2">
              <PencilSimple size={16} />
              Update
            </TabsTrigger>
            {showDelete && onDelete && (
              <TabsTrigger value="delete" className="gap-2">
                <Trash size={16} />
                Delete
              </TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="flex-1 px-4 sm:px-6">
            <TabsContent value="update" className="dialog-tabs-content mt-4">
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground">
                    <CheckCircle size={16} className="inline mr-2 text-primary" />
                    {selectedItems.length} {entityName} selected for update
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only fields you modify will be updated. Leave fields empty to keep existing values.
                  </p>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      Processing... {Math.round(progress)}%
                    </p>
                  </div>
                )}

                <div className="dialog-grid-2">
                  {fields.map((field) => (
                    <div key={field.key} className="dialog-form-field">
                      <Label htmlFor={field.key} className="dialog-form-label">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>

                {Object.keys(updates).length > 0 && (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium mb-2">Updates to be applied:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(updates).map(([key, value]) => {
                        const field = fields.find(f => f.key === key)
                        return (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {field?.label}: {String(value)}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {showDelete && onDelete && (
              <TabsContent value="delete" className="dialog-tabs-content mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <Warning size={24} className="text-destructive flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="font-semibold text-destructive">Permanent Deletion Warning</p>
                        <p className="text-sm text-muted-foreground">
                          You are about to delete <strong>{selectedItems.length} {entityName}</strong>.
                          This action cannot be undone and all associated data will be permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        Deleting... {Math.round(progress)}%
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Items to be deleted:</p>
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-1">
                        {selectedItems.slice(0, 10).map((item, idx) => (
                          <div key={item.id} className="text-xs p-2 bg-background rounded border">
                            {idx + 1}. ID: {item.id}
                          </div>
                        ))}
                        {selectedItems.length > 10 && (
                          <p className="text-xs text-muted-foreground italic p-2">
                            ...and {selectedItems.length - 10} more
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>

        <DialogFooter className="dialog-footer-fixed px-4 sm:px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="dialog-button"
          >
            Cancel
          </Button>
          
          {currentTab === 'update' ? (
            <Button
              onClick={handleUpdate}
              disabled={isProcessing || Object.keys(updates).length === 0}
              className="dialog-button gap-2"
            >
              <PencilSimple size={16} />
              Update {selectedItems.length} {entityName}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
              className="dialog-button gap-2"
            >
              <Trash size={16} />
              Delete {selectedItems.length} {entityName}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
