export interface ModuleDiagnostics {
  timestamp: string
  moduleLoadErrors: string[]
  failedModules: {
    name: string
    path: string
    error: string
  }[]
  loadedModules: number
  totalAttempts: number
  recommendations: string[]
}

declare global {
  interface Window {
    getModuleLoadErrors?: () => string[]
    checkModules?: () => ModuleDiagnostics
    getModuleDiagnostics?: () => ModuleDiagnostics
  }
}

export function runModuleDiagnostics(): ModuleDiagnostics {
  const diagnostics: ModuleDiagnostics = {
    timestamp: new Date().toISOString(),
    moduleLoadErrors: [],
    failedModules: [],
    loadedModules: 0,
    totalAttempts: 0,
    recommendations: []
  }

  if (typeof window !== 'undefined' && typeof window.getModuleLoadErrors === 'function') {
    diagnostics.moduleLoadErrors = window.getModuleLoadErrors()
  }

  const performanceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  const moduleAttempts = performanceEntries.filter(entry => 
    entry.name.includes('/assets/') && 
    (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))
  )

  diagnostics.totalAttempts = moduleAttempts.length

  moduleAttempts.forEach(entry => {
    if (entry.transferSize === 0 && entry.decodedBodySize === 0) {
      const moduleName = entry.name.split('/assets/')[1]?.split('-')[0] || 'Unknown'
      
      if (!diagnostics.failedModules.find(m => m.name === moduleName)) {
        diagnostics.failedModules.push({
          name: moduleName,
          path: entry.name,
          error: 'Failed to load (0 bytes transferred)'
        })
      }
    } else {
      diagnostics.loadedModules++
    }
  })

  if (diagnostics.failedModules.length > 0) {
    diagnostics.recommendations.push('Clear browser cache and reload the application')
    diagnostics.recommendations.push('Check browser console for specific MIME type errors')
    diagnostics.recommendations.push('Verify network connectivity and try again')
  }

  if (diagnostics.failedModules.length > 5) {
    diagnostics.recommendations.push('Multiple modules failing - this may indicate a build or deployment issue')
  }

  const kvErrors = performanceEntries.filter(entry => 
    entry.name.includes('/_spark/kv/')
  ).filter(entry => entry.transferSize === 0)

  if (kvErrors.length > 0) {
    diagnostics.recommendations.push('KV storage experiencing connectivity issues - data persistence may be affected')
  }

  return diagnostics
}

export function printModuleDiagnostics(): ModuleDiagnostics {
  const diagnostics = runModuleDiagnostics()
  
  console.group('%c🔍 Module Load Diagnostics', 'color: #3b82f6; font-weight: bold; font-size: 14px;')
  console.log('Timestamp:', diagnostics.timestamp)
  console.log('Total module load attempts:', diagnostics.totalAttempts)
  console.log('Successfully loaded:', diagnostics.loadedModules)
  console.log('Failed modules:', diagnostics.failedModules.length)
  
  if (diagnostics.moduleLoadErrors.length > 0) {
    console.group('%c⚠️ Tracked Module Errors', 'color: #f59e0b; font-weight: bold;')
    diagnostics.moduleLoadErrors.forEach(error => console.log('•', error))
    console.groupEnd()
  }

  if (diagnostics.failedModules.length > 0) {
    console.group('%c❌ Failed Module Details', 'color: #ef4444; font-weight: bold;')
    console.table(diagnostics.failedModules)
    console.groupEnd()
  }

  if (diagnostics.recommendations.length > 0) {
    console.group('%c💡 Recommendations', 'color: #10b981; font-weight: bold;')
    diagnostics.recommendations.forEach((rec, i) => console.log(`${i + 1}.`, rec))
    console.groupEnd()
  }

  console.groupEnd()

  return diagnostics
}

if (typeof window !== 'undefined') {
  window.checkModules = printModuleDiagnostics
  window.getModuleDiagnostics = runModuleDiagnostics
}
