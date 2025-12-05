export interface GlobalDialogSettings {
  defaultSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  defaultHeight: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  enableFixedHeaders: boolean
  enableFixedFooters: boolean
  overlayOpacity: number
  animationDuration: number
}

export const DEFAULT_DIALOG_SETTINGS: GlobalDialogSettings = {
  defaultSize: 'lg',
  defaultHeight: 'auto',
  enableFixedHeaders: true,
  enableFixedFooters: true,
  overlayOpacity: 0.8,
  animationDuration: 200,
}

export const DIALOG_SIZE_PRESETS = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-[95vw]',
} as const

export const DIALOG_HEIGHT_PRESETS = {
  auto: 'max-h-[85vh]',
  sm: 'max-h-[50vh]',
  md: 'max-h-[65vh]',
  lg: 'max-h-[80vh]',
  xl: 'max-h-[90vh]',
  full: 'max-h-[95vh]',
} as const

export const DIALOG_MODULE_DEFAULTS: Record<string, Partial<GlobalDialogSettings>> = {
  'invoice': {
    defaultSize: '2xl',
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
    defaultSize: 'md',
    defaultHeight: 'auto',
  },
  'confirmation': {
    defaultSize: 'sm',
    defaultHeight: 'auto',
  },
  'report': {
    defaultSize: '2xl',
    defaultHeight: 'full',
  },
  'settings': {
    defaultSize: 'lg',
    defaultHeight: 'lg',
  },
  'analytics': {
    defaultSize: '2xl',
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
