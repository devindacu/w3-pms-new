import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ArrowsLeftRight, Clock, User, DeviceMobile, Check, X, GitMerge, Eye } from '@phosphor-icons/react'
import { type SyncConflict, type ConflictResolutionStrategy } from '@/hooks/use-server-sync'
import { formatDistanceToNow } from 'date-fns'

interface ServerSyncConflictDialogProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  conflicts: SyncConflict<T>[]
  onResolve: (conflictId: string, strategy: ConflictResolutionStrategy, customValue?: T) => void
  onIgnore: (conflictId: string) => void
}

export function ServerSyncConflictDialog<T>({
  open,
  onOpenChange,
  conflicts,
  onResolve,
  onIgnore,
}: ServerSyncConflictDialogProps<T>) {
  const [selectedConflictIndex, setSelectedConflictIndex] = useState(0)
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictResolutionStrategy>('keep-local')
  const [showPreview, setShowPreview] = useState(false)

  const currentConflict = conflicts[selectedConflictIndex]

  if (!currentConflict) {
    return null
  }

  const getPreviewValue = (): T => {
    switch (selectedStrategy) {
      case 'keep-local':
        return currentConflict.localValue
      case 'keep-remote':
        return currentConflict.remoteValue
      case 'merge':
        return mergeValues(currentConflict.localValue, currentConflict.remoteValue, currentConflict.fieldChanges)
      default:
        return currentConflict.localValue
    }
  }

  const mergeValues = (local: T, remote: T, fieldChanges: string[]): T => {
    if (typeof local !== 'object' || local === null) return local
    if (typeof remote !== 'object' || remote === null) return remote

    const merged = { ...remote } as any
    
    for (const key of Object.keys(local as any)) {
      if (!fieldChanges.includes(key)) {
        merged[key] = (local as any)[key]
      }
    }

    return merged as T
  }

  const handleResolve = () => {
    onResolve(currentConflict.id, selectedStrategy, selectedStrategy === 'manual' ? getPreviewValue() : undefined)
    
    if (selectedConflictIndex < conflicts.length - 1) {
      setSelectedConflictIndex(selectedConflictIndex + 1)
    } else {
      onOpenChange(false)
    }
  }

  const handleIgnore = () => {
    onIgnore(currentConflict.id)
    
    if (selectedConflictIndex < conflicts.length - 1) {
      setSelectedConflictIndex(selectedConflictIndex + 1)
    } else {
      onOpenChange(false)
    }
  }

  const renderValue = (value: T) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([key, val]) => {
            const isChanged = currentConflict.fieldChanges.includes(key)
            return (
              <div key={key} className={`flex items-start justify-between gap-4 p-2 rounded ${isChanged ? 'bg-accent/20 border border-accent/30' : 'bg-muted/50'}`}>
                <span className="text-sm font-medium text-muted-foreground min-w-[120px]">{key}:</span>
                <span className="text-sm flex-1 text-right break-all">
                  {JSON.stringify(val)}
                  {isChanged && <Badge variant="outline" className="ml-2 bg-accent/20 text-accent-foreground text-xs">Changed</Badge>}
                </span>
              </div>
            )
          })}
        </div>
      )
    }
    return <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <ArrowsLeftRight size={24} className="text-warning" />
              Sync Conflict Detected
            </DialogTitle>
            <Badge variant="outline" className="bg-warning/10 text-warning">
              {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <DialogDescription>
            Changes were made to the same data on different devices. Choose how to resolve this conflict.
          </DialogDescription>
        </DialogHeader>

        {conflicts.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {conflicts.map((conflict, index) => (
              <Button
                key={conflict.id}
                variant={index === selectedConflictIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedConflictIndex(index)}
                className="shrink-0"
              >
                Conflict {index + 1}
              </Button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4">
          <Card className="p-4 border-warning/30">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Local:</span>
                <span>{formatDistanceToNow(currentConflict.localTimestamp, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Remote:</span>
                <span>{formatDistanceToNow(currentConflict.remoteTimestamp, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">You (v{currentConflict.localVersion})</span>
              </div>
              <div className="flex items-center gap-2">
                <DeviceMobile size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Other Device (v{currentConflict.remoteVersion})</span>
              </div>
            </div>
          </Card>

          <Tabs value={showPreview ? 'preview' : 'compare'} onValueChange={(v) => setShowPreview(v === 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compare">Compare Versions</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye size={16} className="mr-2" />
                Preview Result
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compare" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <DeviceMobile size={16} />
                      Your Changes (Local)
                    </h4>
                    <Badge variant="outline" className="bg-primary/10">v{currentConflict.localVersion}</Badge>
                  </div>
                  <Separator className="mb-3" />
                  <div className="max-h-[300px] overflow-y-auto">
                    {renderValue(currentConflict.localValue)}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <DeviceMobile size={16} />
                      Server Changes (Remote)
                    </h4>
                    <Badge variant="outline" className="bg-secondary/10">v{currentConflict.remoteVersion}</Badge>
                  </div>
                  <Separator className="mb-3" />
                  <div className="max-h-[300px] overflow-y-auto">
                    {renderValue(currentConflict.remoteValue)}
                  </div>
                </Card>
              </div>

              <Card className="p-4 bg-muted/30">
                <h4 className="font-semibold text-sm mb-2">Changed Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {currentConflict.fieldChanges.length > 0 ? (
                    currentConflict.fieldChanges.map((field) => (
                      <Badge key={field} variant="outline" className="bg-accent/10">
                        {field}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific field changes detected</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Preview: {selectedStrategy.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h4>
                  <Badge variant="outline" className="bg-success/10">Result</Badge>
                </div>
                <Separator className="mb-3" />
                <div className="max-h-[400px] overflow-y-auto">
                  {renderValue(getPreviewValue())}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="p-4 bg-primary/5">
            <h4 className="font-semibold text-sm mb-3">Resolution Strategy</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant={selectedStrategy === 'keep-local' ? 'default' : 'outline'}
                onClick={() => setSelectedStrategy('keep-local')}
                className="h-auto py-4 px-4 flex flex-col items-start gap-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <DeviceMobile size={20} />
                  <span className="font-semibold">Keep My Changes</span>
                </div>
                <p className="text-xs text-left opacity-80">Use your local version and discard remote changes</p>
              </Button>

              <Button
                variant={selectedStrategy === 'keep-remote' ? 'default' : 'outline'}
                onClick={() => setSelectedStrategy('keep-remote')}
                className="h-auto py-4 px-4 flex flex-col items-start gap-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <ArrowsLeftRight size={20} />
                  <span className="font-semibold">Use Server Version</span>
                </div>
                <p className="text-xs text-left opacity-80">Accept remote changes and discard your local changes</p>
              </Button>

              <Button
                variant={selectedStrategy === 'merge' ? 'default' : 'outline'}
                onClick={() => setSelectedStrategy('merge')}
                className="h-auto py-4 px-4 flex flex-col items-start gap-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <GitMerge size={20} />
                  <span className="font-semibold">Merge Both</span>
                </div>
                <p className="text-xs text-left opacity-80">Intelligently combine non-conflicting fields</p>
              </Button>
            </div>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleIgnore} className="gap-2">
            <X size={16} />
            Ignore
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
            <Eye size={16} />
            {showPreview ? 'Compare' : 'Preview'}
          </Button>
          <Button onClick={handleResolve} className="gap-2">
            <Check size={16} />
            Resolve ({selectedConflictIndex + 1}/{conflicts.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
