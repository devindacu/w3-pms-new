export const DIALOG_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-[95vw]',
} as const

export const DIALOG_HEIGHTS = {
  auto: 'max-h-[85vh]',
  sm: 'max-h-[50vh]',
  md: 'max-h-[65vh]',
  lg: 'max-h-[80vh]',
  xl: 'max-h-[90vh]',
  full: 'max-h-[95vh]',
} as const

export type DialogSize = keyof typeof DIALOG_SIZES
export type DialogHeight = keyof typeof DIALOG_HEIGHTS

export const DEFAULT_DIALOG_CLASSES = {
  overlay: 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
  content: 'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200',
  header: 'flex flex-col space-y-1.5 text-center sm:text-left pb-4 border-b',
  title: 'text-lg font-semibold leading-none tracking-tight',
  description: 'text-sm text-muted-foreground',
  body: 'overflow-y-auto px-6 py-4',
  footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t mt-4',
} as const

export function getDialogContentClass(size: DialogSize = 'lg', height: DialogHeight = 'auto'): string {
  return `${DEFAULT_DIALOG_CLASSES.content} ${DIALOG_SIZES[size]} ${DIALOG_HEIGHTS[height]} w-full rounded-lg p-6`
}

export function getDialogBodyClass(height: DialogHeight = 'auto'): string {
  return `${DEFAULT_DIALOG_CLASSES.body} ${DIALOG_HEIGHTS[height]}`
}
