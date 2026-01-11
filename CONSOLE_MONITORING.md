# Console Error Monitoring Guide

## Overview

The W3 Hotel PMS now includes comprehensive console error monitoring to track and diagnose module loading issues and runtime errors.

## Features

### 1. Visual Console Monitor Widget

A floating widget in the bottom-right corner of the screen that displays:
- Real-time error tracking
- Error categorization (module, network, runtime, warning)
- Error count and timestamp
- Expandable detailed view

**Usage:**
- Click the widget to expand/collapse
- View categorized errors with counts
- Clear errors using the "Clear" button

### 2. Browser Console Diagnostics

Run detailed diagnostics from the browser console:

```javascript
// Run full diagnostic report
window.checkModules()

// Get diagnostic data programmatically
const diagnostics = window.getModuleDiagnostics()
console.log(diagnostics)
```

**Diagnostic Report Includes:**
- Total module load attempts
- Successfully loaded modules count
- Failed module details with paths
- KV storage connectivity status
- Actionable recommendations

### 3. Enhanced Error Filtering

The error handler now intelligently filters:
- **Suppressed**: Browser extension errors, CORS warnings from GitHub infrastructure, ResizeObserver warnings
- **Logged as Info**: Network errors (tunneling, CORS)
- **Tracked**: Module loading errors, runtime errors, React warnings

### 4. Quick Actions in Header

Two new buttons in the top-right header:
- **Bug Icon**: Run module diagnostics (prints to console)
- **Refresh Icon**: Clear cache and reload application

## Common Error Types

### Module Load Errors
**Symptoms:** "Failed to fetch dynamically imported module" or "MIME type" errors

**Causes:**
- Browser cache contains stale module references
- Network interruption during module load
- Build process generated incorrect module chunks

**Solutions:**
1. Click the Refresh icon to clear cache and reload
2. Check Network tab for failed requests
3. Run `window.checkModules()` for detailed analysis

### Network Errors
**Symptoms:** 502 Bad Gateway, CORS errors, tunnel service errors

**Causes:**
- GitHub Codespaces tunnel service interruption
- KV storage endpoint temporarily unavailable
- Network connectivity issues

**Solutions:**
1. Wait a few seconds and retry
2. Refresh the page
3. Check Codespaces connection status

### Runtime Errors
**Symptoms:** React component errors, state management errors

**Causes:**
- Invalid data in KV storage
- Component lifecycle issues
- Missing data dependencies

**Solutions:**
1. Check the Console Monitor for specific error messages
2. Clear application data and reload
3. Review component stack traces

## Error Monitoring Best Practices

1. **Keep Monitor Open**: Expand the Console Monitor when testing new features
2. **Run Diagnostics Regularly**: Use `window.checkModules()` after major navigation
3. **Clear Errors Between Tests**: Click "Clear" button to reset error tracking
4. **Check Before Reporting**: Run diagnostics before reporting issues

## Debugging Workflow

1. **Notice an issue** → Check Console Monitor widget
2. **See errors** → Click to expand and read details
3. **Need more info** → Click Bug icon or run `window.checkModules()`
4. **Review recommendations** → Follow suggested solutions
5. **Still broken** → Clear cache and reload with Refresh icon
6. **Report persistent issues** → Include diagnostic output

## Console API Reference

### `window.checkModules()`
Prints formatted diagnostic report to console and returns diagnostics object.

**Returns:** `ModuleDiagnostics`

### `window.getModuleDiagnostics()`
Returns diagnostic data without console output.

**Returns:** 
```typescript
{
  timestamp: string
  moduleLoadErrors: string[]
  failedModules: Array<{
    name: string
    path: string
    error: string
  }>
  loadedModules: number
  totalAttempts: number
  recommendations: string[]
}
```

### `window.getModuleLoadErrors()`
Returns array of module names that failed to load (tracked by error handler).

**Returns:** `string[]`

## Configuration

Error filtering is configured in `index.html`:
- `ignoredWarnings`: Browser/library warnings to suppress
- `ignoredNetworkErrors`: Infrastructure-related network errors

Module retry logic is in `App.tsx`:
- 3 retry attempts
- Exponential backoff (1s, 2s, 3s)

## Troubleshooting

**Monitor not appearing:**
- Check browser console for React rendering errors
- Ensure `<ConsoleMonitor />` is rendered in App.tsx

**Diagnostics not working:**
- Reload page to ensure `/lib/diagnostics.ts` is loaded
- Check for TypeScript compilation errors

**Too many false positives:**
- Adjust `ignoredWarnings` array in `index.html`
- Review error categorization logic in `ConsoleMonitor.tsx`

## Future Enhancements

Potential improvements:
- Export error logs to file
- Email error reports to developers
- Integration with error tracking services (Sentry, etc.)
- Performance metrics dashboard
- Automated error resolution suggestions
