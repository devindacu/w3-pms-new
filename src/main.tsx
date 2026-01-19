import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

if (typeof React === 'undefined' || React === null) {
  console.error('React is not properly loaded!')
  throw new Error('React module failed to load. Please refresh the page.')
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find root element')
}

try {
  const root = createRoot(rootElement)
  root.render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  )
} catch (error) {
  console.error('Failed to render app:', error)
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; background: #0f0f0f; color: #fff; font-family: system-ui, sans-serif;">
      <div style="max-width: 500px; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #aaa; margin-bottom: 20px;">Failed to start the application. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Reload Page
        </button>
        <details style="margin-top: 20px; text-align: left; background: #1a1a1a; padding: 16px; border-radius: 6px;">
          <summary style="cursor: pointer; font-weight: 600; margin-bottom: 8px;">Error Details</summary>
          <pre style="font-size: 12px; color: #ef4444; overflow-x: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        </details>
      </div>
    </div>
  `
}
