import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  ChartBar,
  Path,
  Clock,
  TrendUp,
  Database,
  ArrowRight,
  Sparkle
} from '@phosphor-icons/react'
import type { NavigationPattern } from '@/hooks/use-predictive-preload'

interface NavigationInsightsProps {
  mostVisited: Array<{ module: string; count: number }>
  commonPatterns: NavigationPattern[]
  timeBasedPreferences: Record<string, string[]>
  onClearHistory: () => void
}

const moduleDisplayNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'quick-ops': 'Quick Operations',
  'front-office': 'Front Office',
  'housekeeping': 'Housekeeping',
  'fnb': 'F&B / POS',
  'inventory': 'Inventory',
  'procurement': 'Procurement',
  'finance': 'Finance',
  'hr': 'HR & Staff',
  'analytics': 'Analytics',
  'construction': 'Maintenance',
  'suppliers': 'Suppliers',
  'user-management': 'User Management',
  'kitchen': 'Kitchen',
  'forecasting': 'AI Forecasting',
  'crm': 'Guest Relations',
  'channel-manager': 'Channel Manager',
  'room-revenue': 'Room & Revenue',
  'extra-services': 'Extra Services',
  'invoice-center': 'Invoice Center',
  'revenue-comparison': 'Revenue Comparison',
  'settings': 'Settings'
}

const timeOfDayLabels: Record<string, string> = {
  'bucket-0': '12 AM - 2 AM',
  'bucket-1': '2 AM - 4 AM',
  'bucket-2': '4 AM - 6 AM',
  'bucket-3': '6 AM - 8 AM',
  'bucket-4': '8 AM - 10 AM',
  'bucket-5': '10 AM - 12 PM',
  'bucket-6': '12 PM - 2 PM',
  'bucket-7': '2 PM - 4 PM',
  'bucket-8': '4 PM - 6 PM',
  'bucket-9': '6 PM - 8 PM',
  'bucket-10': '8 PM - 10 PM',
  'bucket-11': '10 PM - 12 AM'
}

export function NavigationInsights({
  mostVisited,
  commonPatterns,
  timeBasedPreferences,
  onClearHistory
}: NavigationInsightsProps) {
  const maxVisitCount = Math.max(...mostVisited.map(m => m.count), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkle size={20} className="text-primary" weight="fill" />
            Navigation Insights
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered analysis of your navigation patterns for predictive preloading
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearHistory}
          className="rounded-lg"
        >
          <Database size={16} className="mr-2" />
          Clear History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendUp size={18} className="text-primary" weight="duotone" />
            <h4 className="font-semibold">Most Visited Modules</h4>
          </div>
          
          {mostVisited.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <ChartBar size={32} className="mx-auto mb-2 opacity-30" />
              No navigation data yet. Start using the system to see insights.
            </div>
          ) : (
            <div className="space-y-4">
              {mostVisited.map(({ module, count }) => (
                <div key={module} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {moduleDisplayNames[module] || module}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {count} visits
                    </Badge>
                  </div>
                  <Progress value={(count / maxVisitCount) * 100} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Path size={18} className="text-accent" weight="duotone" />
            <h4 className="font-semibold">Common Navigation Patterns</h4>
          </div>
          
          {commonPatterns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Path size={32} className="mx-auto mb-2 opacity-30" />
              No patterns detected yet. Navigate between modules to build patterns.
            </div>
          ) : (
            <div className="space-y-3">
              {commonPatterns.slice(0, 5).map((pattern, index) => (
                <div
                  key={`${pattern.from}-${pattern.to}-${index}`}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {moduleDisplayNames[pattern.from] || pattern.from}
                    </span>
                    <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {moduleDisplayNames[pattern.to] || pattern.to}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    ×{pattern.count}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-success" weight="duotone" />
          <h4 className="font-semibold">Time-Based Usage Patterns</h4>
        </div>
        
        {Object.keys(timeBasedPreferences).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Clock size={32} className="mx-auto mb-2 opacity-30" />
            No time-based patterns yet. Use the system at different times to see patterns.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(timeBasedPreferences)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([timeBucket, modules]) => (
                <div key={timeBucket} className="space-y-2">
                  <div className="text-sm font-semibold text-muted-foreground">
                    {timeOfDayLabels[timeBucket] || timeBucket}
                  </div>
                  <div className="space-y-1.5">
                    {modules.slice(0, 3).map((module) => (
                      <Badge
                        key={module}
                        variant="secondary"
                        className="text-xs w-full justify-start"
                      >
                        {moduleDisplayNames[module] || module}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkle size={20} className="text-primary mt-0.5" weight="fill" />
          <div className="flex-1">
            <h4 className="font-semibold mb-2">How Predictive Preloading Works</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The system learns from your navigation habits and automatically preloads modules 
              you're likely to visit next. This includes analyzing your most-visited modules, 
              common navigation sequences, and time-of-day preferences to ensure instant 
              module transitions and a seamless experience.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
