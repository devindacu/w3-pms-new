import { Suspense, useEffect, useState } from 'react'
import App from './App'

export function AppWrapper() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSparkAvailability = () => {
      if (typeof window.spark === 'undefined') {
        setError('Spark runtime not available')
        return
      }
      
      if (typeof window.spark.kv === 'undefined') {
        setError('Spark KV store not available')
        return
      }

      setIsReady(true)
    }

    const timer = setTimeout(checkSparkAvailability, 100)
    return () => clearTimeout(timer)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Initialization Error</div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Please refresh the page to try again.</p>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Initializing W3 Hotel PMS...</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading W3 Hotel PMS...</p>
        </div>
      </div>
    }>
      <App />
    </Suspense>
  )
}

export default AppWrapper
