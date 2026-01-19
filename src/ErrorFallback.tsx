import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  if (import.meta.env.DEV) throw error;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#0f0f0f',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#ef4444' }}>
            ⚠️ Runtime Error
          </h2>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>
            Something unexpected happened. The error details are shown below.
          </p>
        </div>
        
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#aaa' }}>
            Error Details:
          </h3>
          <pre style={{
            fontSize: '12px',
            color: '#ef4444',
            background: '#0a0a0a',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #222',
            overflow: 'auto',
            maxHeight: '150px'
          }}>
            {error.message}
          </pre>
        </div>
        
        <button
          onClick={resetErrorBoundary}
          style={{
            width: '100%',
            background: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
        >
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}
