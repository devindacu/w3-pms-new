export const DIALOG_SIZES = {
  sm: 'sm:max-w-md max-w-[calc(100vw-2rem)]',
  md: 'sm:max-w-2xl max-w-[calc(100vw-2rem)]',
  lg: 'sm:max-w-4xl max-w-[calc(100vw-2rem)]',
  xl: 'sm:max-w-6xl max-w-[calc(100vw-2rem)]',
  '2xl': 'sm:max-w-7xl max-w-[calc(100vw-2rem)]',
  full: 'max-w-[calc(100vw-1rem)] sm:max-w-[95vw]',
} as const

export const DIALOG_HEIGHTS = {
  auto: 'max-h-[90vh] sm:max-h-[85vh]',
  sm: 'max-h-[60vh] sm:max-h-[50vh]',
  md: 'max-h-[70vh] sm:max-h-[65vh]',
  lg: 'max-h-[85vh] sm:max-h-[80vh]',
  xl: 'max-h-[92vh] sm:max-h-[90vh]',
  full: 'max-h-[95vh]',
} as const

export type DialogSize = keyof typeof DIALOG_SIZES
export type DialogHeight = keyof typeof DIALOG_HEIGHTS

export const DEFAULT_DIALOG_CLASSES = {
  overlay: 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
  content: 'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] gap-2 sm:gap-4 border bg-background shadow-lg duration-200',
  header: 'flex flex-col space-y-1 sm:space-y-1.5 text-left pb-3 sm:pb-4 border-b shrink-0',
  title: 'text-base sm:text-lg font-semibold leading-none tracking-tight',
  description: 'text-xs sm:text-sm text-muted-foreground',
  body: 'overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-3 sm:py-4 flex-1',
  footer: 'flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2 sm:space-x-2 pt-3 sm:pt-4 border-t shrink-0',
} as const

export function getDialogContentClass(size: DialogSize = 'lg', height: DialogHeight = 'auto'): string {
  return `${DEFAULT_DIALOG_CLASSES.content} ${DIALOG_SIZES[size]} ${DIALOG_HEIGHTS[height]} w-full rounded-lg p-3 sm:p-6`
}

export function getDialogBodyClass(height: DialogHeight = 'auto'): string {
  return `${DEFAULT_DIALOG_CLASSES.body} ${DIALOG_HEIGHTS[height]}`
}
