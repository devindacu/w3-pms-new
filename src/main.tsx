import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary"
import "@github/spark/spark"

import "./main.css"

import AppWrapper from './AppWrapper'
import { ErrorFallback } from './ErrorFallback'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find root element')
}

try {
  const root = createRoot(rootElement)
  
  root.render(
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('React Error Boundary caught an error:', error, info)
      }}
      onReset={() => {
        window.location.reload()
      }}
    >
      <AppWrapper />
    </ErrorBoundary>
  )
} catch (error) {
  console.error('Fatal error during React initialization:', error)
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-center; min-height: 100vh; padding: 1rem; background: #fafafa;">
      <div style="max-width: 32rem; text-align: center;">
        <h1 style="font-size: 1.5rem; font-weight: bold; color: #dc2626; margin-bottom: 1rem;">
          Failed to Initialize Application
        </h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">
          The application encountered a critical error during initialization. Please refresh the page to try again.
        </p>
        <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; text-align: left; overflow: auto; font-size: 0.75rem;">
${error instanceof Error ? error.message : String(error)}
        </pre>
        <button 
          onclick="window.location.reload()" 
          style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;"
        >
          Reload Page
        </button>
      </div>
    </div>
  `
}
