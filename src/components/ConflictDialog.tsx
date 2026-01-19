import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Warning, 
  CheckCircle, 
  XCircle, 
  ArrowsLeftRight, 
  Clock,
  ArrowRight,
  GitMerge,
  User,
  CaretRight
} from '@phosphor-icons/react'
import { type Conflict, type ConflictResolutionStrategy, getConflictDiff, formatTimestamp } from '@/lib/conflictResolution'

interface ConflictDialogProps<T> {
  conflict: Conflict<T>
  open: boolean
  onClose: () => void
  onResolve: (conflictId: string, strategy: ConflictResolutionStrategy, customResolution?: T) => void
  onIgnore: (conflictId: string) => void
  formatValue?: (value: T) => React.ReactNode
}

export function ConflictDialog<T>({
  conflict,
  open,
  onClose,
  onResolve,
  onIgnore,
  formatValue,
}: ConflictDialogProps<T>) {
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictResolutionStrategy>('manual')
  const [selectedVersion, setSelectedVersion] = useState<'local' | 'remote' | null>(null)

  const handleResolve = () => {
    if (selectedStrategy === 'manual' && selectedVersion) {
      const resolution = selectedVersion === 'local' ? conflict.localVersion.value : conflict.remoteVersion.value
      onResolve(conflict.id, selectedStrategy, resolution)
    } else {
      onResolve(conflict.id, selectedStrategy)
    }
    onClose()
  }

  const handleIgnore = () => {
    onIgnore(conflict.id)
    onClose()
  }

  const diff = getConflictDiff(conflict.localVersion.value, conflict.remoteVersion.value)

  const defaultFormatValue = (value: T) => {
    if (typeof value === 'object' && value !== null) {
      return <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
    }
    return <span className="font-mono text-sm">{String(value)}</span>
  }

  const renderValue = formatValue || defaultFormatValue

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Warning size={24} className="text-destructive" />
            Sync Conflict Detected
          </DialogTitle>
          <DialogDescription>
            This data was modified simultaneously in multiple tabs. Choose how to resolve the conflict.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-4 border-destructive/50 bg-destructive/5">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-destructive mt-0.5 shrink-0" />
              <div className="space-y-1 flex-1">
                <p className="font-semibold text-sm">Conflict Details</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Resource:</span>
                    <span className="ml-2 font-medium">{conflict.key}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Detected:</span>
                    <span className="ml-2 font-medium">{formatTimestamp(conflict.detectedAt)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Your Change:</span>
                    <span className="ml-2 font-medium">{formatTimestamp(conflict.localVersion.metadata.timestamp)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Other Tab:</span>
                    <span className="ml-2 font-medium">{formatTimestamp(conflict.remoteVersion.metadata.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
              <TabsTrigger value="diff">Field Changes</TabsTrigger>
              <TabsTrigger value="strategy">Resolution</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    selectedVersion === 'local' 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedVersion('local')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-primary" />
                      <h3 className="font-semibold">Your Version</h3>
                    </div>
                    {selectedVersion === 'local' && (
                      <CheckCircle size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={14} />
                      {formatTimestamp(conflict.localVersion.metadata.timestamp)}
                    </div>
                    <Separator />
                    <ScrollArea className="h-64">
                      {renderValue(conflict.localVersion.value)}
                    </ScrollArea>
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    selectedVersion === 'remote' 
                      ? 'border-accent ring-2 ring-accent/20' 
                      : 'hover:border-accent/50'
                  }`}
                  onClick={() => setSelectedVersion('remote')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ArrowsLeftRight size={18} className="text-accent" />
                      <h3 className="font-semibold">Other Tab's Version</h3>
                    </div>
                    {selectedVersion === 'remote' && (
                      <CheckCircle size={20} className="text-accent" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={14} />
                      {formatTimestamp(conflict.remoteVersion.metadata.timestamp)}
                    </div>
                    <Separator />
                    <ScrollArea className="h-64">
                      {renderValue(conflict.remoteVersion.value)}
                    </ScrollArea>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="diff" className="space-y-3">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <GitMerge size={18} />
                  Changed Fields
                </h3>
                <ScrollArea className="h-72">
                  {diff.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No field-level differences detected</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {diff.map((change, index) => (
                        <Card key={index} className="p-3 bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {change.field}
                            </Badge>
                            <CaretRight size={14} className="text-muted-foreground" />
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground font-medium">Your Value</p>
                              <div className="p-2 bg-primary/10 rounded border border-primary/20">
                                {typeof change.local === 'object' ? (
                                  <pre className="text-xs overflow-x-auto">{JSON.stringify(change.local, null, 2)}</pre>
                                ) : (
                                  <span className="font-mono text-xs">{String(change.local)}</span>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground font-medium">Other Tab's Value</p>
                              <div className="p-2 bg-accent/10 rounded border border-accent/20">
                                {typeof change.remote === 'object' ? (
                                  <pre className="text-xs overflow-x-auto">{JSON.stringify(change.remote, null, 2)}</pre>
                                ) : (
                                  <span className="font-mono text-xs">{String(change.remote)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Choose Resolution Strategy</h3>
                <RadioGroup value={selectedStrategy} onValueChange={(v) => setSelectedStrategy(v as ConflictResolutionStrategy)}>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual" className="cursor-pointer flex-1">
                        <div className="font-semibold">Manual Selection</div>
                        <p className="text-sm text-muted-foreground">Choose which version to keep (select above)</p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="last-write-wins" id="last-write-wins" />
                      <Label htmlFor="last-write-wins" className="cursor-pointer flex-1">
                        <div className="font-semibold">Last Write Wins</div>
                        <p className="text-sm text-muted-foreground">Keep the most recent change</p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="first-write-wins" id="first-write-wins" />
                      <Label htmlFor="first-write-wins" className="cursor-pointer flex-1">
                        <div className="font-semibold">First Write Wins</div>
                        <p className="text-sm text-muted-foreground">Keep the earliest change</p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="merge" id="merge" />
                      <Label htmlFor="merge" className="cursor-pointer flex-1">
                        <div className="font-semibold">Smart Merge</div>
                        <p className="text-sm text-muted-foreground">Attempt to merge both versions (works best for arrays/objects)</p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleIgnore}>
            <XCircle size={18} className="mr-2" />
            Ignore Conflict
          </Button>
          <Button 
            onClick={handleResolve}
            disabled={selectedStrategy === 'manual' && !selectedVersion}
          >
            <CheckCircle size={18} className="mr-2" />
            Resolve Conflict
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
