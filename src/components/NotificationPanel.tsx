import { useState } from 'react'
import { Notification, NotificationPreferences } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Bell,
  Check,
  X,
  Archive,
  Warning,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardText,
  ShoppingCart,
  Truck,
  CurrencyDollar,
  Wrench,
  SignOut,
  SignIn,
  ForkKnife,
  ChefHat,
  ChartBar,
  Users,
  ArrowsClockwise,
  Hammer,
  TrendDown,
  Sparkle,
  TrendUp,
  Gear,
  Trash
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { getNotificationColor } from '@/lib/notificationHelpers'

interface NotificationPanelProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDismiss: (id: string) => void
  onArchive: (id: string) => void
  onClearAll: () => void
  preferences?: NotificationPreferences
  onUpdatePreferences?: (preferences: NotificationPreferences) => void
}

const iconMap = {
  Bell,
  Package,
  Warning,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardText,
  ShoppingCart,
  Truck,
  CurrencyDollar,
  Wrench,
  SignOut,
  SignIn,
  ForkKnife,
  ChefHat,
  ChartBar,
  Users,
  ArrowsClockwise,
  Hammer,
  TrendDown,
  Sparkle,
  TrendUp
}

const getIcon = (notification: Notification) => {
  const iconName = notification.type.includes('inventory') ? 'Package' :
    notification.type.includes('warning') || notification.type.includes('critical') ? 'Warning' :
    notification.type.includes('approved') || notification.type.includes('ready') ? 'CheckCircle' :
    notification.type.includes('rejected') || notification.type.includes('failed') ? 'XCircle' :
    notification.type.includes('pending') ? 'Clock' :
    notification.type.includes('requisition') ? 'ClipboardText' :
    notification.type.includes('po-') ? 'ShoppingCart' :
    notification.type.includes('delivery') ? 'Truck' :
    notification.type.includes('payment') || notification.type.includes('invoice') ? 'CurrencyDollar' :
    notification.type.includes('maintenance') ? 'Wrench' :
    notification.type.includes('checkout') ? 'SignOut' :
    notification.type.includes('checkin') ? 'SignIn' :
    notification.type.includes('order') ? 'ForkKnife' :
    notification.type.includes('kitchen') ? 'ChefHat' :
    notification.type.includes('recipe') || notification.type.includes('waste') ? 'ChartBar' :
    notification.type.includes('staff') || notification.type.includes('leave') ? 'Users' :
    notification.type.includes('shift') ? 'ArrowsClockwise' :
    notification.type.includes('construction') || notification.type.includes('material') ? 'Hammer' :
    notification.type.includes('supplier') ? 'TrendDown' :
    notification.type.includes('forecast') ? 'Sparkle' :
    notification.type.includes('demand') ? 'TrendUp' :
    'Bell'
  
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Bell
  return IconComponent
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onArchive,
  onClearAll,
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')

  const unreadCount = notifications.filter(n => n.status === 'unread').length
  const criticalCount = notifications.filter(n => n.priority === 'critical' && n.status === 'unread').length

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'unread'
    if (filter === 'critical') return n.priority === 'critical'
    return true
  }).filter(n => n.status !== 'archived' && n.status !== 'dismissed')

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (a.priority === 'critical' && b.priority !== 'critical') return -1
    if (a.priority !== 'critical' && b.priority === 'critical') return 1
    return b.createdAt - a.createdAt
  })

  const getPriorityBadge = (priority: Notification['priority']) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'default',
      critical: 'destructive'
    } as const

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md z-50">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                Mark All Read
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {unreadCount === 0 ? (
              'All caught up!'
            ) : (
              <>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                {criticalCount > 0 && ` • ${criticalCount} critical`}
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="critical">
              Critical ({criticalCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {sortedNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'unread' ? 'No unread notifications' :
                     filter === 'critical' ? 'No critical notifications' :
                     'No notifications'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedNotifications.map((notification) => {
                    const IconComponent = getIcon(notification)
                    const colorClass = getNotificationColor(notification.priority)

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border-2 ${
                          notification.status === 'unread'
                            ? 'bg-accent/10 border-accent'
                            : 'bg-card border-border'
                        } hover:bg-accent/5 transition-colors`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${colorClass}`}>
                            <IconComponent size={20} weight="fill" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm leading-tight">
                                {notification.title}
                              </h4>
                              {getPriorityBadge(notification.priority)}
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {notification.module}
                              </Badge>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                              </span>
                            </div>

                            {notification.actionLabel && (
                              <div className="mt-3">
                                <Button size="sm" variant="outline">
                                  {notification.actionLabel}
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1">
                            {notification.status === 'unread' && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => onMarkAsRead(notification.id)}
                              >
                                <Check size={16} />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => onArchive(notification.id)}
                            >
                              <Archive size={16} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => onDismiss(notification.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onClearAll}
              >
                <Trash size={16} className="mr-2" />
                Clear All
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
