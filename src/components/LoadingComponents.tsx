import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const borderMap = {
  sm: 'border-2',
  md: 'border-2',
  lg: 'border-4',
  xl: 'border-4'
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizeMap[size],
          borderMap[size]
        )}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  fullScreen?: boolean
  className?: string
  children?: React.ReactNode
}

export function LoadingOverlay({ 
  isLoading, 
  message, 
  fullScreen = false,
  className,
  children 
}: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingSpinner size="xl" label={message} />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        <LoadingSpinner size="lg" label={message} />
      </div>
    </div>
  )
}

interface LoadingStateProps {
  isLoading: boolean
  error?: Error | null
  loadingMessage?: string
  errorMessage?: string
  onRetry?: () => void
  children: React.ReactNode
  minHeight?: string
}

export function LoadingState({
  isLoading,
  error,
  loadingMessage = 'Loading...',
  errorMessage,
  onRetry,
  children,
  minHeight = '200px'
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight }}>
        <LoadingSpinner size="lg" label={loadingMessage} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6" style={{ minHeight }}>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-destructive">Error</p>
          <p className="text-sm text-muted-foreground">
            {errorMessage || error.message || 'Something went wrong'}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  return <>{children}</>
}
