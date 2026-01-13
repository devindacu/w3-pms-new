import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSyncedKV } from '@/hooks/use-synced-kv'
import { 
  Lightning, 
  ArrowsClockwise, 
  CheckCircle, 
  PlusCircle,
  Trash,
  Info
} from '@phosphor-icons/react'
import { toast } from 'sonner'

type DemoItem = {
  id: string
  text: string
  createdAt: number
}

export function SyncDemoDialog() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useSyncedKV<DemoItem[]>('sync-demo-items', [])
  const [newItemText, setNewItemText] = useState('')

  const addItem = () => {
    if (!newItemText.trim()) {
      toast.error('Please enter some text')
      return
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        id: `item-${Date.now()}`,
        text: newItemText,
        createdAt: Date.now(),
      },
    ])

    setNewItemText('')
    toast.success('Item added - check other tabs!')
  }

  const deleteItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
    toast.success('Item deleted - synced across tabs!')
  }

  const clearAll = () => {
    setItems([])
    toast.success('All items cleared')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Lightning size={16} />
          Sync Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowsClockwise size={24} className="text-primary" />
            Real-Time Sync Demo
          </DialogTitle>
          <DialogDescription>
            Try opening this app in multiple tabs and watch changes sync in real-time!
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 bg-muted/50 border-primary/20">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-primary mt-0.5 shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">How to test:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Open this PMS in another browser tab (Ctrl+T / Cmd+T)</li>
                <li>Open this demo dialog in both tabs</li>
                <li>Add or delete items in one tab</li>
                <li>Watch them instantly appear/disappear in the other tab!</li>
              </ol>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-item">Add New Item</Label>
              <Input
                id="new-item"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                placeholder="Type something and press Enter..."
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={addItem} className="gap-2">
                <PlusCircle size={18} />
                Add
              </Button>
              {(items || []).length > 0 && (
                <Button onClick={clearAll} variant="outline" className="gap-2">
                  <Trash size={18} />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items ({(items || []).length})</Label>
              {(items || []).length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle size={14} className="text-success" />
                  Synced Across Tabs
                </Badge>
              )}
            </div>

            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {(items || []).length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <ArrowsClockwise size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No items yet. Add one to see sync in action!</p>
                </div>
              ) : (
                (items || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.text}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={16} className="text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-2 text-xs">
            <Lightning size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Pro tip:</strong> All data in the PMS works this way! 
              Updates to rooms, guests, invoices, etc. sync instantly across all open tabs.
            </p>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
