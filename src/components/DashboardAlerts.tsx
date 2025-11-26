import { Notification } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from '@phosphor-icons/react'
import { getNotificationColor } from '@/lib/notificationHelpers'

interface DashboardAlertsProps {
  notifications: Notification[]
  maxDisplay?: number
  onDismiss: (id: string) => void
  onViewAll: () => void
}

export function DashboardAlerts({
  notifications,
  maxDisplay = 5,
  onDismiss,
  onViewAll
}: DashboardAlertsProps) {
  const activeNotifications = notifications
    .filter(n => n.status === 'unread' && (n.priority === 'critical' || n.priority === 'high'))
    .sort((a, b) => {
      if (a.priority === 'critical' && b.priority !== 'critical') return -1
      if (a.priority !== 'critical' && b.priority === 'critical') return 1
      return b.createdAt - a.createdAt
    })
    .slice(0, maxDisplay)

  if (activeNotifications.length === 0) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Important Alerts</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All ({notifications.filter(n => n.status === 'unread').length})
        </Button>
      </div>

      <div className="space-y-3">
        {activeNotifications.map((notification) => {
          const colorClass = getNotificationColor(notification.priority)
          
          return (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 ${
                notification.priority === 'critical'
                  ? 'border-l-destructive bg-destructive/5'
                  : 'border-l-accent bg-accent/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold text-sm ${colorClass}`}>
                      {notification.title}
                    </h4>
                    <Badge 
                      variant={notification.priority === 'critical' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {notification.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  {notification.actionLabel && (
                    <Button size="sm" variant="outline" className="mt-2">
                      {notification.actionLabel}
                    </Button>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => onDismiss(notification.id)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
