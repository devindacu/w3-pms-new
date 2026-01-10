import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ModuleLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-full max-w-xs" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export function ModuleLoadingFallback({ moduleName }: { moduleName?: string }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-accent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Loading {moduleName || 'Module'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Preparing your workspace with all the latest data...
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
