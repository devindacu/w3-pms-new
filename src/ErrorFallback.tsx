import * as React from 'react'
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  if (import.meta.env.DEV) {
    console.error('Development mode error:', error)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: '#fafafa'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          color: '#991b1b'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            <Warning size={20} style={{ marginRight: '0.5rem' }} />
            Runtime Error
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            Something unexpected happened. The error details are shown below.
          </div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontWeight: '600',
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            Error Details:
          </h3>
          <pre style={{
            fontSize: '0.75rem',
            color: '#dc2626',
            background: '#f9fafb',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            border: '1px solid #e5e7eb',
            overflow: 'auto',
            maxHeight: '8rem'
          }}>
            {error.message}
          </pre>
          {error.stack && (
            <details style={{ marginTop: '0.5rem' }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>
                Stack trace
              </summary>
              <pre style={{
                fontSize: '0.625rem',
                color: '#6b7280',
                background: '#f9fafb',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                overflow: 'auto',
                maxHeight: '12rem'
              }}>
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        
        <button
          onClick={resetErrorBoundary}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem 1rem',
            background: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={(e) => e.currentTarget.style.background = 'white'}
        >
          <ArrowClockwise size={16} style={{ marginRight: '0.5rem' }} />
          Try Again
        </button>
      </div>
    </div>
  );
}
