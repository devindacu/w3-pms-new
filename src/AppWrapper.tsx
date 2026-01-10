import * as React from 'react'
import { Suspense, useEffect, useState } from 'react'
import App from './App'

if (!React) {
  throw new Error('React module is not available in AppWrapper')
}

export function AppWrapper() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSparkAvailability = () => {
      try {
        if (typeof window === 'undefined') {
          setError('Window object not available')
          return
        }

        if (typeof window.spark === 'undefined') {
          setError('Spark runtime not available')
          return
        }
        
        if (typeof window.spark.kv === 'undefined') {
          setError('Spark KV store not available')
          return
        }

        setIsReady(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error during initialization')
      }
    }

    const timer = setTimeout(checkSparkAvailability, 100)
    return () => clearTimeout(timer)
  }, [])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: '#fafafa'
      }}>
        <div style={{
          maxWidth: '28rem',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#dc2626',
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Initialization Error
          </div>
          <p style={{
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            {error}
          </p>
          <p style={{
            color: '#9ca3af',
            fontSize: '0.875rem'
          }}>
            Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280' }}>Initializing W3 Hotel PMS...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280' }}>Loading W3 Hotel PMS...</p>
        </div>
      </div>
    }>
      <App />
    </Suspense>
  )
}

export default AppWrapper
