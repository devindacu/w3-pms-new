import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useSyncedKV } from '@/hooks/use-synced-kv'
import { useBroadcastSync, type SyncMessage } from '@/hooks/use-broadcast-sync'
import {
  ArrowsClockwise,
  CheckCircle,
  XCircle,
  Lightning,
  Bell,
  Clock,
  Users,
  Database,
  Trash,
  Plus,
  Play,
  Info,
  Warning,
  Pencil,
  Copy,
  CloudArrowDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type TestItem = {
  id: string
  name: string
  value: number
  status: 'active' | 'pending' | 'completed'
  createdAt: number
  updatedAt: number
  tabId?: string
}

type ActivityLog = {
  id: string
  type: 'create' | 'update' | 'delete' | 'sync' | 'broadcast'
  message: string
  timestamp: number
  tabId: string
  success: boolean
}

export function SyncTestingPanel() {
  const [testItems, setTestItems] = useSyncedKV<TestItem[]>('sync-test-items', [])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [messageCount, setMessageCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now())
  const [newItemName, setNewItemName] = useState('')
  const [autoTestRunning, setAutoTestRunning] = useState(false)
  const [testProgress, setTestProgress] = useState(0)

  const handleSyncMessage = (message: SyncMessage) => {
    setMessageCount((prev) => prev + 1)
    setLastSyncTime(Date.now())
    
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      type: 'sync',
      message: `Received ${message.type} from ${message.tabId.substring(0, 8)}...`,
      timestamp: Date.now(),
      tabId: message.tabId,
      success: true,
    }
    
    setActivityLogs((prev) => [log, ...prev].slice(0, 50))
  }

  const { broadcast, tabId } = useBroadcastSync(handleSyncMessage)

  const logActivity = (
    type: ActivityLog['type'],
    message: string,
    success: boolean = true
  ) => {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: Date.now(),
      tabId,
      success,
    }
    setActivityLogs((prev) => [log, ...prev].slice(0, 50))
  }

  const createTestItem = () => {
    if (!newItemName.trim()) {
      toast.error('Please enter an item name')
      return
    }

    const newItem: TestItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      value: Math.floor(Math.random() * 100),
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tabId: tabId.substring(0, 8),
    }

    setTestItems((current) => [...current, newItem])
    logActivity('create', `Created item: ${newItemName}`)
    toast.success('Item created - check other tabs!')
    setNewItemName('')
  }

  const updateTestItem = (id: string) => {
    setTestItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              value: Math.floor(Math.random() * 100),
              updatedAt: Date.now(),
            }
          : item
      )
    )
    logActivity('update', `Updated item: ${id}`)
    toast.success('Item updated - synced!')
  }

  const deleteTestItem = (id: string) => {
    const item = (testItems || []).find((i) => i.id === id)
    setTestItems((current) => current.filter((item) => item.id !== id))
    logActivity('delete', `Deleted item: ${item?.name || id}`)
    toast.success('Item deleted - synced!')
  }

  const clearAllItems = () => {
    setTestItems([])
    logActivity('delete', 'Cleared all items')
    toast.success('All items cleared')
  }

  const sendCustomBroadcast = () => {
    broadcast({
      type: 'notification',
      value: {
        message: 'Custom broadcast test',
        timestamp: Date.now(),
      },
    })
    logActivity('broadcast', 'Sent custom broadcast message')
    toast.info('Custom broadcast sent!')
  }

  const runAutomatedTest = async () => {
    setAutoTestRunning(true)
    setTestProgress(0)
    logActivity('create', 'Starting automated sync test...')

    const steps = [
      { name: 'Creating items', action: () => {
        for (let i = 0; i < 3; i++) {
          setTestItems((current) => [
            ...current,
            {
              id: `auto-${Date.now()}-${i}`,
              name: `Auto Test Item ${i + 1}`,
              value: Math.floor(Math.random() * 100),
              status: 'active',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              tabId: tabId.substring(0, 8),
            },
          ])
        }
      }},
      { name: 'Updating items', action: () => {
        setTestItems((current) =>
          current.map((item) => ({
            ...item,
            value: Math.floor(Math.random() * 100),
            updatedAt: Date.now(),
          }))
        )
      }},
      { name: 'Broadcasting messages', action: () => {
        for (let i = 0; i < 3; i++) {
          broadcast({
            type: 'notification',
            value: { test: `Auto test message ${i + 1}` },
          })
        }
      }},
      { name: 'Deleting items', action: () => {
        setTestItems((current) => current.slice(0, -1))
      }},
    ]

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      logActivity('create', `Step ${i + 1}: ${step.name}`)
      step.action()
      setTestProgress(((i + 1) / steps.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    logActivity('create', 'Automated test completed!', true)
    toast.success('Automated test completed!')
    setAutoTestRunning(false)
  }

  const copyTabId = () => {
    navigator.clipboard.writeText(tabId)
    toast.success('Tab ID copied to clipboard')
  }

  const timeSinceSync = Date.now() - lastSyncTime

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-3">
          <ArrowsClockwise size={32} className="text-primary animate-spin-slow" />
          Real-Time Sync Testing
        </h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive testing interface for multi-tab synchronization
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] pointer-events-none" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CloudArrowDown size={24} className="text-primary" />
            </div>
            🚀 Ready to See Live Sync in Action?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg border-2 border-primary/20">
            <p className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span className="text-2xl">👀</span>
              Follow these steps to witness real-time magic:
            </p>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0">1</span>
                <div>
                  <p className="font-semibold mb-1">Open Multiple Tabs</p>
                  <p className="text-muted-foreground">Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+T</kbd> (Windows/Linux) or <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Cmd+T</kbd> (Mac) to open 2-3 new tabs</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground font-bold text-xs shrink-0">2</span>
                <div>
                  <p className="font-semibold mb-1">Navigate to Sync Testing</p>
                  <p className="text-muted-foreground">In each new tab, click <strong>Testing & Tools → Sync Testing</strong> in the sidebar</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground font-bold text-xs shrink-0">3</span>
                <div>
                  <p className="font-semibold mb-1">Arrange Side-by-Side</p>
                  <p className="text-muted-foreground">Arrange your browser windows or use split-screen to see multiple tabs at once</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border-2 border-success/20">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-success text-success-foreground font-bold text-xs shrink-0 animate-pulse">4</span>
                <div>
                  <p className="font-semibold mb-1 flex items-center gap-2">
                    <Lightning size={16} className="text-success" />
                    Test the Magic!
                  </p>
                  <p className="text-muted-foreground">Create, update, or delete items in one tab and watch them <strong className="text-success">instantly sync</strong> to all other tabs! ✨</p>
                </div>
              </li>
            </ol>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Warning size={20} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-semibold text-amber-900 dark:text-amber-200">Powered by BroadcastChannel API</p>
              <p className="text-amber-800/80 dark:text-amber-300/80">
                All changes are automatically broadcast across browser tabs using native web APIs - no server required! This enables <strong>instant multi-user collaboration</strong> in the same browser.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Current Tab ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                {tabId}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={copyTabId}
              >
                <Copy size={14} />
                Copy ID
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database size={18} className="text-accent" />
              Test Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(testItems || []).length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Synced across all tabs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell size={18} className="text-secondary" />
              Sync Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{messageCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Messages received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock size={18} className="text-success" />
              Last Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {timeSinceSync < 1000 ? 'Just now' : 
               timeSinceSync < 60000 ? `${Math.floor(timeSinceSync / 1000)}s ago` :
               `${Math.floor(timeSinceSync / 60000)}m ago`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(lastSyncTime).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">
            <Database size={16} className="mr-2" />
            Test Items
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock size={16} className="mr-2" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Play size={16} className="mr-2" />
            Auto Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Test Item</CardTitle>
              <CardDescription>
                Add a new item and watch it sync to all other tabs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createTestItem()}
                    placeholder="Enter item name..."
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={createTestItem} className="gap-2">
                    <Plus size={18} />
                    Create
                  </Button>
                  {(testItems || []).length > 0 && (
                    <Button onClick={clearAllItems} variant="destructive" className="gap-2">
                      <Trash size={18} />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Synced Items ({(testItems || []).length})</span>
                {(testItems || []).length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle size={14} className="text-success" />
                    Live Sync Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Changes made here will instantly appear in all other tabs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(testItems || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No test items yet</p>
                    <p className="text-sm">Create one above to start testing sync</p>
                  </div>
                ) : (
                  (testItems || []).map((item, index) => (
                    <Card key={item.id} className="p-4 hover:shadow-md transition-all animate-slide-in hover:scale-[1.01] border-l-4 border-l-primary">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{item.name}</h4>
                            <Badge variant={
                              item.status === 'active' ? 'default' :
                              item.status === 'completed' ? 'secondary' :
                              'outline'
                            } className="animate-pulse">
                              {item.status}
                            </Badge>
                            {Date.now() - item.updatedAt < 3000 && (
                              <Badge variant="outline" className="gap-1 bg-success/10 border-success/20 animate-pulse">
                                <CheckCircle size={12} className="text-success" />
                                <span className="text-success text-xs">Synced!</span>
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span>Value:</span>
                              <span className="font-mono font-semibold text-foreground bg-primary/10 px-1.5 py-0.5 rounded">{item.value}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>Tab:</span>
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.tabId}</code>
                            </div>
                            <div>Created: {new Date(item.createdAt).toLocaleTimeString()}</div>
                            <div>Updated: {new Date(item.updatedAt).toLocaleTimeString()}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTestItem(item.id)}
                            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Pencil size={14} />
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTestItem(item.id)}
                            className="gap-1"
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Activity Log ({activityLogs.length})</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivityLogs([])}
                  disabled={activityLogs.length === 0}
                >
                  Clear Log
                </Button>
              </CardTitle>
              <CardDescription>
                Real-time log of all sync events and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No activity logged yet</p>
                  </div>
                ) : (
                  activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        'p-2 rounded border-l-4 flex items-start gap-2',
                        log.type === 'create' && 'bg-green-50 dark:bg-green-950/20 border-l-green-500',
                        log.type === 'update' && 'bg-blue-50 dark:bg-blue-950/20 border-l-blue-500',
                        log.type === 'delete' && 'bg-red-50 dark:bg-red-950/20 border-l-red-500',
                        log.type === 'sync' && 'bg-purple-50 dark:bg-purple-950/20 border-l-purple-500',
                        log.type === 'broadcast' && 'bg-amber-50 dark:bg-amber-950/20 border-l-amber-500'
                      )}
                    >
                      {log.success ? (
                        <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-destructive mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {log.type}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="mt-1 text-foreground">{log.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Sync Tests</CardTitle>
              <CardDescription>
                Run automated tests to verify sync functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={runAutomatedTest}
                  disabled={autoTestRunning}
                  className="gap-2 h-auto py-4"
                >
                  <Play size={20} />
                  <div className="text-left">
                    <div className="font-semibold">Run Full Test Suite</div>
                    <div className="text-xs opacity-80">Create, update, broadcast, delete</div>
                  </div>
                </Button>

                <Button
                  onClick={sendCustomBroadcast}
                  variant="outline"
                  className="gap-2 h-auto py-4"
                >
                  <Bell size={20} />
                  <div className="text-left">
                    <div className="font-semibold">Send Broadcast</div>
                    <div className="text-xs opacity-80">Test custom message broadcast</div>
                  </div>
                </Button>
              </div>

              {autoTestRunning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Test Progress</span>
                    <span className="text-muted-foreground">{Math.round(testProgress)}%</span>
                  </div>
                  <Progress value={testProgress} />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Test Checklist</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                    <span>Items created in one tab appear in all tabs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                    <span>Updates sync instantly across tabs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                    <span>Deletions remove items from all tabs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                    <span>Activity log shows sync events</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                    <span>Tab counter updates in header badge</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightning size={18} className="text-primary" />
                Expected Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <h5 className="font-semibold">When you create an item:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Item appears immediately in current tab</li>
                  <li>BroadcastChannel sends update to all tabs</li>
                  <li>Other tabs receive message and update their state</li>
                  <li>All tabs show identical data within milliseconds</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold">Sync indicator behavior:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Shows "Syncing..." animation during updates</li>
                  <li>Displays count of active tabs</li>
                  <li>Updates last sync timestamp</li>
                  <li>Green color indicates healthy sync</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
