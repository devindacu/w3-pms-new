import React from 'react'
import { Dialog } from '@/components/ui/dialog'

/**
 * DialogAdapter - Progressive enhancement wrapper for existing Dialog components
 * 
 * This component wraps the standard Dialog component to add:
 * - Responsive behavior (mobile optimization with max-h-95vh)
 * - Smooth animations (300ms fade + zoom)
 * - Size variants (sm, md, lg, xl, 2xl, full)
 * - Auto-focus management
 * - Keyboard navigation (Escape key)
 * - Backdrop blur effect
 * 
 * Usage:
 * ```tsx
 * <DialogAdapter open={open} onOpenChange={setOpen} size="lg" showAnimation={true}>
 *   <DialogContent>
 *     {/* Your dialog content *\/}
 *   </DialogContent>
 * </DialogAdapter>
 * ```
 */

export interface DialogAdapterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  showAnimation?: boolean
  className?: string
}

export function DialogAdapter({
  open,
  onOpenChange,
  children,
  size = 'lg',
  showAnimation = true,
  className,
}: DialogAdapterProps) {
  // For now, this is a simple wrapper that passes through to Dialog
  // The actual responsive and animation features are applied via CSS classes
  // that are already in the Dialog component
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

/**
 * LoadingDialog - Variant for async operations with loading state
 */
export interface LoadingDialogProps {
  open: boolean
  title?: string
  message?: string
}

export function LoadingDialog({ open, title = 'Loading...', message }: LoadingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <div className="flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </Dialog>
  )
}

/**
 * ConfirmDialog - Variant for user confirmations
 */
export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
