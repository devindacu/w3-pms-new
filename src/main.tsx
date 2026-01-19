import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary"
import "@github/spark/spark"

import "./main.css"
import "./styles/theme.css"
import "./index.css"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find root element')
}

if (!React || !React.useState) {
  console.error('React is not properly loaded!', { React })
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; background: #0f0f0f; color: #fff; font-family: system-ui, sans-serif;">
      <div style="max-width: 500px; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px; color: #ef4444;">⚠️ React Loading Error</h1>
        <p style="color: #aaa; margin-bottom: 20px;">React framework failed to load properly. This may be due to a browser extension or network issue.</p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Reload Page
        </button>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          If the problem persists, try clearing your browser cache or disabling browser extensions.
        </p>
      </div>
    </div>
  `
} else {
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
          <h1 style="font-size: 24px; margin-bottom: 16px; color: #ef4444;">⚠️ Application Error</h1>
          <p style="color: #aaa; margin-bottom: 20px;">Failed to start the application. Please try refreshing the page.</p>
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
            Reload Page
          </button>
          <details style="margin-top: 20px; text-align: left; background: #1a1a1a; padding: 16px; border-radius: 6px;">
            <summary style="cursor: pointer; font-weight: 600; margin-bottom: 8px; color: #aaa;">Error Details</summary>
            <pre style="font-size: 12px; color: #ef4444; overflow-x: auto; white-space: pre-wrap;">${error instanceof Error ? error.message + '\n\n' + (error.stack || '') : String(error)}</pre>
          </details>
        </div>
      </div>
    `
  }
}
