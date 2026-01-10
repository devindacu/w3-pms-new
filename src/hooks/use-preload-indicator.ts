import { useState, useEffect } from 'react'
import { addPreloadListener } from './use-module-preloader'

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

const moduleDisplayNames: Record<Module, string> = {
  'front-office': 'Front Office',
  'housekeeping': 'Housekeeping',
  'fnb': 'F&B / POS',
  'inventory': 'Inventory',
  'procurement': 'Procurement',
  'finance': 'Finance',
  'hr': 'HR & Staff',
  'analytics': 'Analytics',
  'construction': 'Maintenance',
  'suppliers': 'Suppliers',
  'user-management': 'User Management',
  'kitchen': 'Kitchen',
  'forecasting': 'AI Forecasting',
  'crm': 'Guest Relations',
  'channel-manager': 'Channel Manager',
  'room-revenue': 'Room & Revenue',
  'extra-services': 'Extra Services',
  'invoice-center': 'Invoice Center',
  'revenue-comparison': 'Revenue Comparison',
  'settings': 'Settings'
}

export function usePreloadIndicator() {
  const [preloadingModule, setPreloadingModule] = useState<{
    module: Module
    displayName: string
  } | null>(null)

  useEffect(() => {
    const unsubscribe = addPreloadListener((module: Module) => {
      setPreloadingModule({
        module,
        displayName: moduleDisplayNames[module] || module
      })
      
      setTimeout(() => {
        setPreloadingModule(null)
      }, 1500)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    isPreloading: preloadingModule !== null,
    preloadingModule: preloadingModule?.displayName
  }
}
