export const DIALOG_SIZES = {
  sm: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-md max-w-[calc(100vw-1rem)]',
  md: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-2xl max-w-[calc(100vw-1rem)]',
  lg: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-4xl lg:max-w-5xl max-w-[calc(100vw-1rem)]',
  xl: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-5xl lg:max-w-6xl max-w-[calc(100vw-1rem)]',
  '2xl': 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto md:max-w-6xl lg:max-w-7xl max-w-[calc(100vw-1rem)]',
  full: 'w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-[calc(100vw-3rem)] md:max-w-[95vw] lg:max-w-[92vw] max-w-[calc(100vw-1rem)]',
} as const

export const DIALOG_HEIGHTS = {
  auto: 'max-h-[95vh] sm:max-h-[92vh] md:max-h-[90vh]',
  sm: 'max-h-[60vh] sm:max-h-[55vh] md:max-h-[50vh]',
  md: 'max-h-[70vh] sm:max-h-[68vh] md:max-h-[65vh]',
  lg: 'max-h-[85vh] sm:max-h-[83vh] md:max-h-[80vh]',
  xl: 'max-h-[92vh] sm:max-h-[91vh] md:max-h-[90vh]',
  full: 'max-h-[95vh] sm:max-h-[95vh] md:max-h-[95vh]',
} as const

export type DialogSize = keyof typeof DIALOG_SIZES
export type DialogHeight = keyof typeof DIALOG_HEIGHTS

export const DEFAULT_DIALOG_CLASSES = {
  overlay: 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
  content: 'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] gap-2 sm:gap-3 md:gap-4 border bg-background shadow-lg duration-200',
  header: 'flex flex-col space-y-1 sm:space-y-1.5 text-left pb-2 sm:pb-3 md:pb-4 border-b shrink-0',
  title: 'text-sm sm:text-base md:text-lg font-semibold leading-none tracking-tight',
  description: 'text-xs sm:text-sm text-muted-foreground',
  body: 'overflow-y-auto overflow-x-hidden px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 md:py-4 flex-1',
  footer: 'flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2 sm:space-x-2 pt-2 sm:pt-3 md:pt-4 border-t shrink-0',
} as const

export function getDialogContentClass(size: DialogSize = 'lg', height: DialogHeight = 'auto'): string {
  return `${DEFAULT_DIALOG_CLASSES.content} ${DIALOG_SIZES[size]} ${DIALOG_HEIGHTS[height]} rounded-lg p-3 sm:p-4 md:p-5 lg:p-6`
}

export function getDialogBodyClass(height: DialogHeight = 'auto'): string {
  return `${DEFAULT_DIALOG_CLASSES.body}`
}
