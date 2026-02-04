/**
 * Error Monitoring Dashboard Component
 * Displays real-time error logs and metrics for production monitoring
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  Info,
  RefreshCw,
  Download,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useKV } from '@/hooks/use-kv'

interface ErrorLog {
  id: string
  timestamp: number
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  component?: string
  user?: string
  context?: Record<string, any>
}

interface ErrorMetrics {
  totalErrors: number
  totalWarnings: number
  errorRate: number
  topErrors: { message: string; count: number }[]
  errorsByComponent: { component: string; count: number }[]
}

export default function ErrorMonitoringDashboard() {
  const { value: errorLogs = [], setValue: setErrorLogs } = useKV<ErrorLog[]>('error-logs', [])
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([])
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'error' | 'warning' | 'info'>('all')
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | 'all'>('24h')
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null)

  useEffect(() => {
    // Filter logs based on selected level and time range
    const now = Date.now()
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }

    const cutoff = now - timeRanges[timeRange]
    let filtered = errorLogs.filter(log => log.timestamp >= cutoff)
    
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel)
    }

    setFilteredLogs(filtered.sort((a, b) => b.timestamp - a.timestamp))

    // Calculate metrics
    calculateMetrics(filtered)
  }, [errorLogs, selectedLevel, timeRange])

  const calculateMetrics = (logs: ErrorLog[]) => {
    const errors = logs.filter(l => l.level === 'error')
    const warnings = logs.filter(l => l.level === 'warning')

    // Calculate error rate (errors per hour)
    const oldestLog = logs.length > 0 ? Math.min(...logs.map(l => l.timestamp)) : Date.now()
    const timeSpanHours = (Date.now() - oldestLog) / (1000 * 60 * 60)
    const errorRate = timeSpanHours > 0 ? errors.length / timeSpanHours : 0

    // Top errors by message
    const errorCounts = new Map<string, number>()
    errors.forEach(err => {
      const msg = err.message.substring(0, 100) // Truncate for grouping
      errorCounts.set(msg, (errorCounts.get(msg) || 0) + 1)
    })
    const topErrors = Array.from(errorCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Errors by component
    const componentCounts = new Map<string, number>()
    errors.forEach(err => {
      const component = err.component || 'Unknown'
      componentCounts.set(component, (componentCounts.get(component) || 0) + 1)
    })
    const errorsByComponent = Array.from(componentCounts.entries())
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setMetrics({
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      errorRate,
      topErrors,
      errorsByComponent
    })
  }

  const handleRefresh = () => {
    // Trigger refresh of error logs
    window.location.reload()
  }

  const handleExport = () => {
    // Export error logs to JSON file
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `error-logs-${new Date().toISOString()}.json`
    link.click()
  }

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all error logs?')) {
      setErrorLogs([])
    }
  }

  const getLevelIcon = (level: ErrorLog['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'info':
        return <Info className="h-4 w-4 text-info" />
    }
  }

  const getLevelBadge = (level: ErrorLog['level']) => {
    const variants = {
      error: 'destructive',
      warning: 'default',
      info: 'secondary'
    }
    return <Badge variant={variants[level] as any}>{level.toUpperCase()}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Error Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time error tracking and diagnostics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearLogs}>
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalErrors}</div>
              <p className="text-xs text-muted-foreground">
                {timeRange === '1h' ? 'Last hour' : timeRange === '24h' ? 'Last 24 hours' : timeRange === '7d' ? 'Last 7 days' : 'All time'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalWarnings}</div>
              <p className="text-xs text-muted-foreground">
                Non-critical issues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              {metrics.errorRate > 10 ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 text-success" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Errors per hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredLogs.length}</div>
              <p className="text-xs text-muted-foreground">
                Filtered entries
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex gap-2">
            <span className="text-sm font-medium">Level:</span>
            <Button
              variant={selectedLevel === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('all')}
            >
              All
            </Button>
            <Button
              variant={selectedLevel === 'error' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('error')}
            >
              Errors
            </Button>
            <Button
              variant={selectedLevel === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('warning')}
            >
              Warnings
            </Button>
            <Button
              variant={selectedLevel === 'info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('info')}
            >
              Info
            </Button>
          </div>

          <div className="flex gap-2">
            <span className="text-sm font-medium">Time Range:</span>
            <Button
              variant={timeRange === '1h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('1h')}
            >
              1 Hour
            </Button>
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >
              24 Hours
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top Errors */}
      {metrics && metrics.topErrors.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Errors</CardTitle>
              <CardDescription>Most frequent error messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.topErrors.map((error, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1" title={error.message}>
                      {error.message}
                    </span>
                    <Badge variant="destructive">{error.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Errors by Component</CardTitle>
              <CardDescription>Components with most errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.errorsByComponent.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{item.component}</span>
                    <Badge variant="destructive">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {errorLogs.length} total logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No error logs found for the selected filters
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getLevelBadge(log.level)}
                              {log.component && (
                                <Badge variant="outline">{log.component}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm font-medium">{log.message}</p>
                          {log.stack && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground">
                                Stack trace
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                {log.stack}
                              </pre>
                            </details>
                          )}
                          {log.context && Object.keys(log.context).length > 0 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground">
                                Additional context
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(log.context, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
