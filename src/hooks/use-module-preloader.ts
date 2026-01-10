import { useEffect, useCallback, useRef } from 'react'

type Module = 
  | 'front-office'
  | 'housekeeping'
  | 'fnb'
  | 'inventory'
  | 'procurement'
  | 'finance'
  | 'hr'
  | 'analytics'
  | 'construction'
  | 'suppliers'
  | 'user-management'
  | 'kitchen'
  | 'forecasting'
  | 'crm'
  | 'channel-manager'
  | 'room-revenue'
  | 'extra-services'
  | 'invoice-center'
  | 'revenue-comparison'
  | 'settings'

const moduleImports: Record<Module, () => Promise<any>> = {
  'front-office': () => import('@/components/FrontOffice').then(m => ({ default: m.FrontOffice })),
  'housekeeping': () => import('@/components/Housekeeping').then(m => ({ default: m.Housekeeping })),
  'fnb': () => import('@/components/FnBPOS').then(m => ({ default: m.FnBPOS })),
  'inventory': () => import('@/components/InventoryManagement').then(m => ({ default: m.InventoryManagement })),
  'procurement': () => import('@/components/Procurement').then(m => ({ default: m.Procurement })),
  'finance': () => import('@/components/Finance').then(m => ({ default: m.Finance })),
  'hr': () => import('@/components/HRManagement').then(m => ({ default: m.HRManagement })),
  'analytics': () => import('@/components/Analytics').then(m => ({ default: m.Analytics })),
  'construction': () => import('@/components/ConstructionManagement').then(m => ({ default: m.ConstructionManagement })),
  'suppliers': () => import('@/components/SupplierManagement').then(m => ({ default: m.SupplierManagement })),
  'user-management': () => import('@/components/UserManagement').then(m => ({ default: m.UserManagement })),
  'kitchen': () => import('@/components/KitchenOperations').then(m => ({ default: m.KitchenOperations })),
  'forecasting': () => import('@/components/ForecastingAnalytics').then(m => ({ default: m.ForecastingAnalytics })),
  'crm': () => import('@/components/CRM').then(m => ({ default: m.CRM })),
  'channel-manager': () => import('@/components/ChannelManager').then(m => ({ default: m.ChannelManager })),
  'room-revenue': () => import('@/components/RoomRevenueManagement').then(m => ({ default: m.RoomRevenueManagement })),
  'extra-services': () => import('@/components/ExtraServicesManagement').then(m => ({ default: m.ExtraServicesManagement })),
  'invoice-center': () => Promise.all([
    import('@/components/InvoiceManagement').then(m => ({ default: m.InvoiceManagement })),
    import('@/components/PaymentTracking').then(m => ({ default: m.PaymentTracking }))
  ]),
  'revenue-comparison': () => import('@/components/RevenueComparison').then(m => ({ default: m.RevenueComparison })),
  'settings': () => import('@/components/Settings').then(m => ({ default: m.Settings }))
}

const preloadedModules = new Set<Module>()
const preloadingModules = new Map<Module, Promise<any>>()

export function useModulePreloader() {
  const preloadTimeoutRef = useRef<number | undefined>(undefined)

  const preloadModule = useCallback((moduleName: Module): Promise<any> => {
    if (preloadedModules.has(moduleName) || preloadingModules.has(moduleName)) {
      return preloadingModules.get(moduleName) || Promise.resolve(null)
    }

    const importFn = moduleImports[moduleName]
    if (!importFn) {
      return Promise.resolve(null)
    }

    const importPromise = importFn()
      .then((module) => {
        preloadedModules.add(moduleName)
        preloadingModules.delete(moduleName)
        return module
      })
      .catch((error) => {
        console.error(`Failed to preload module: ${moduleName}`, error)
        preloadingModules.delete(moduleName)
        return null
      })

    preloadingModules.set(moduleName, importPromise)
    return importPromise
  }, [])

  const preloadPriorityModules = useCallback(() => {
    const priorityModules: Module[] = [
      'front-office',
      'housekeeping',
      'fnb',
      'inventory',
      'finance'
    ]

    priorityModules.forEach((module) => {
      preloadModule(module)
    })
  }, [preloadModule])

  const preloadAllModules = useCallback(() => {
    const allModules = Object.keys(moduleImports) as Module[]
    
    allModules.forEach((module, index) => {
      setTimeout(() => {
        preloadModule(module)
      }, index * 100)
    })
  }, [preloadModule])

  const preloadOnHover = useCallback((moduleName: Module) => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current)
    }

    preloadTimeoutRef.current = window.setTimeout(() => {
      preloadModule(moduleName)
    }, 50)
  }, [preloadModule])

  useEffect(() => {
    const idleCallback = (window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1))) as (callback: () => void) => number
    
    const handle = idleCallback(() => {
      preloadPriorityModules()
      
      setTimeout(() => {
        preloadAllModules()
      }, 2000)
    })

    return () => {
      if (typeof handle === 'number') {
        const cancelIdle = window.cancelIdleCallback || clearTimeout
        cancelIdle(handle)
      }
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current)
      }
    }
  }, [preloadPriorityModules, preloadAllModules])

  return {
    preloadModule,
    preloadOnHover,
    isModulePreloaded: (moduleName: Module) => preloadedModules.has(moduleName)
  }
}
