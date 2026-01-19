export interface GlobalDialogSettings {
  defaultSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  defaultHeight: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  enableFixedHeaders: boolean
  enableFixedFooters: boolean
  overlayOpacity: number
  animationDuration: number
}

export const DEFAULT_DIALOG_SETTINGS: GlobalDialogSettings = {
  defaultSize: 'full',
  defaultHeight: 'auto',
  enableFixedHeaders: true,
  enableFixedFooters: true,
  overlayOpacity: 0.8,
  animationDuration: 200,
}

export const DIALOG_SIZE_PRESETS = {
  sm: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-md',
  md: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-2xl',
  lg: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-4xl lg:max-w-5xl',
  xl: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-5xl lg:max-w-6xl',
  '2xl': 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-6xl lg:max-w-7xl',
  full: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-[calc(100vw-3rem)] md:max-w-[95vw] lg:max-w-[92vw]',
} as const

export const DIALOG_HEIGHT_PRESETS = {
  auto: 'max-h-[95vh] sm:max-h-[92vh] md:max-h-[90vh]',
  sm: 'max-h-[60vh] sm:max-h-[55vh] md:max-h-[50vh]',
  md: 'max-h-[70vh] sm:max-h-[68vh] md:max-h-[65vh]',
  lg: 'max-h-[85vh] sm:max-h-[83vh] md:max-h-[80vh]',
  xl: 'max-h-[92vh] sm:max-h-[91vh] md:max-h-[90vh]',
  full: 'max-h-[95vh]',
} as const

export const DIALOG_MODULE_DEFAULTS: Record<string, Partial<GlobalDialogSettings>> = {
  'invoice': {
    defaultSize: 'full',
    defaultHeight: 'xl',
  },
  'guest-profile': {
    defaultSize: 'xl',
    defaultHeight: 'lg',
  },
  'reservation': {
    defaultSize: 'xl',
    defaultHeight: 'lg',
  },
  'payment': {
    defaultSize: 'lg',
    defaultHeight: 'auto',
  },
  'confirmation': {
    defaultSize: 'sm',
    defaultHeight: 'auto',
  },
  'report': {
    defaultSize: 'full',
    defaultHeight: 'full',
  },
  'settings': {
    defaultSize: 'xl',
    defaultHeight: 'lg',
  },
  'analytics': {
    defaultSize: 'full',
    defaultHeight: 'xl',
  },
  'filters': {
    defaultSize: 'lg',
    defaultHeight: 'md',
  },
}

export function getModuleDialogDefaults(module: string): GlobalDialogSettings {
  return {
    ...DEFAULT_DIALOG_SETTINGS,
    ...(DIALOG_MODULE_DEFAULTS[module] || {}),
  }
}
