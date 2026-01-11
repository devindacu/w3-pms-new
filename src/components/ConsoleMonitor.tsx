import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

type ErrorType = 'module' | 'network' | 'runtime' | 'warning'

interface ConsoleError {
  id: string
  type: ErrorType
  message: string
  timestamp: Date
  count: number
}

export function ConsoleMonitor() {
  const [errors, setErrors] = useState<ConsoleError[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(true)

  useEffect(() => {
    if (!isMonitoring) return

    const errorMap = new Map<string, ConsoleError>()

    const originalError = console.error
    const originalWarn = console.warn

    console.error = function(...args: any[]) {
      const message = args.join(' ')
      
      let type: ErrorType = 'runtime'
      if (message.includes('MODULE LOAD')) type = 'module'
      else if (message.includes('fetch') || message.includes('network')) type = 'network'

      const id = `${type}-${message.substring(0, 50)}`
      
      if (errorMap.has(id)) {
        const existing = errorMap.get(id)!
        existing.count++
        existing.timestamp = new Date()
      } else {
        errorMap.set(id, {
          id,
          type,
          message,
          timestamp: new Date(),
          count: 1
        })
      }

      setErrors(Array.from(errorMap.values()).sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      ))

      originalError.apply(console, args)
    }

    console.warn = function(...args: any[]) {
      const message = args.join(' ')
      
      if (message.includes('React') || message.includes('component')) {
        const id = `warning-${message.substring(0, 50)}`
        
        if (errorMap.has(id)) {
          const existing = errorMap.get(id)!
          existing.count++
          existing.timestamp = new Date()
        } else {
          errorMap.set(id, {
            id,
            type: 'warning',
            message,
            timestamp: new Date(),
            count: 1
          })
        }

        setErrors(Array.from(errorMap.values()).sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        ))
      }

      originalWarn.apply(console, args)
    }

    const errorHandler = (e: ErrorEvent) => {
      const message = e.error?.message || e.message || 'Unknown error'
      const type: ErrorType = message.includes('module') ? 'module' : 'runtime'
      const id = `${type}-${message.substring(0, 50)}`

      if (errorMap.has(id)) {
        const existing = errorMap.get(id)!
        existing.count++
        existing.timestamp = new Date()
      } else {
        errorMap.set(id, {
          id,
          type,
          message,
          timestamp: new Date(),
          count: 1
        })
      }

      setErrors(Array.from(errorMap.values()).sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      ))
    }

    window.addEventListener('error', errorHandler)

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener('error', errorHandler)
    }
  }, [isMonitoring])

  const clearErrors = () => {
    setErrors([])
  }

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case 'module':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'network':
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'runtime':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />
    }
  }

  const getErrorBadgeVariant = (type: ErrorType): 'destructive' | 'secondary' | 'default' => {
    switch (type) {
      case 'module':
      case 'runtime':
        return 'destructive'
      case 'network':
      case 'warning':
        return 'secondary'
      default:
        return 'default'
    }
  }

  if (!isMonitoring) return null

  const moduleErrors = errors.filter(e => e.type === 'module').length
  const networkErrors = errors.filter(e => e.type === 'network').length
  const runtimeErrors = errors.filter(e => e.type === 'runtime').length
  const warnings = errors.filter(e => e.type === 'warning').length

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="shadow-lg border-2">
        <div 
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            {errors.length === 0 ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            <h3 className="font-semibold text-sm">Console Monitor</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {moduleErrors > 0 && (
              <Badge variant="destructive" className="text-xs">
                {moduleErrors} module
              </Badge>
            )}
            {networkErrors > 0 && (
              <Badge variant="secondary" className="text-xs">
                {networkErrors} network
              </Badge>
            )}
            {runtimeErrors > 0 && (
              <Badge variant="destructive" className="text-xs">
                {runtimeErrors} runtime
              </Badge>
            )}
            {warnings > 0 && (
              <Badge variant="secondary" className="text-xs">
                {warnings} warn
              </Badge>
            )}
            
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t">
            <div className="p-2 flex items-center justify-between border-b bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {errors.length} {errors.length === 1 ? 'issue' : 'issues'} detected
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearErrors}
                className="h-7 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
            
            <ScrollArea className="h-64">
              {errors.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No errors detected</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {errors.map((error) => (
                    <div 
                      key={error.id}
                      className="p-2 rounded-md bg-muted/30 border text-xs space-y-1"
                    >
                      <div className="flex items-start gap-2">
                        {getErrorIcon(error.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={getErrorBadgeVariant(error.type)}
                              className="text-xs capitalize"
                            >
                              {error.type}
                            </Badge>
                            {error.count > 1 && (
                              <Badge variant="outline" className="text-xs">
                                ×{error.count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-foreground break-words font-mono">
                            {error.message.length > 150 
                              ? error.message.substring(0, 150) + '...'
                              : error.message
                            }
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {error.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </Card>
    </div>
  )
}
