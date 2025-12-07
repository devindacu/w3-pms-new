import { useState } from 'react'
import { Notification } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, CaretDown, CaretUp } from '@phosphor-icons/react'
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
  const [isCollapsed, setIsCollapsed] = useState(true)
  
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
    <Card className="overflow-hidden glass-card border-l-4 border-l-warning animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between p-3 md:p-4 bg-warning/5">
        <div className="flex items-center gap-2 md:gap-3">
          <h3 className="text-base md:text-lg font-semibold">Important Alerts</h3>
          <Badge 
            variant="secondary" 
            className="h-6 min-w-[1.5rem] flex items-center justify-center px-2"
          >
            {activeNotifications.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll}
            className="h-8 text-xs md:text-sm"
          >
            View All
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand alerts" : "Collapse alerts"}
          >
            {isCollapsed ? <CaretDown size={18} weight="bold" /> : <CaretUp size={18} weight="bold" />}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3 md:p-4 pt-2 md:pt-3 space-y-2 md:space-y-3">
          {activeNotifications.map((notification, index) => {
            const colorClass = getNotificationColor(notification.priority)
            
            return (
              <div
                key={notification.id}
                className={`p-3 md:p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                  notification.priority === 'critical'
                    ? 'border-l-destructive bg-destructive/5 hover:bg-destructive/10'
                    : 'border-l-accent bg-accent/5 hover:bg-accent/10'
                } animate-in fade-in slide-in-from-bottom-4 duration-200`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className={`font-semibold text-sm md:text-base ${colorClass}`}>
                        {notification.title}
                      </h4>
                      <Badge 
                        variant={notification.priority === 'critical' ? 'destructive' : 'default'}
                        className="text-xs shrink-0"
                      >
                        {notification.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.actionLabel && (
                      <Button size="sm" variant="outline" className="mt-2 text-xs md:text-sm h-8">
                        {notification.actionLabel}
                      </Button>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 md:h-8 md:w-8 shrink-0 hover:bg-destructive/20"
                    onClick={() => onDismiss(notification.id)}
                    aria-label="Dismiss notification"
                  >
                    <X size={16} weight="bold" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
