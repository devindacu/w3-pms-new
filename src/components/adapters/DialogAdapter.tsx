import React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface DialogAdapterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  showAnimation?: boolean
  className?: string
}

export const DialogAdapter = ({
  open,
  onOpenChange,
  children,
  size = 'lg',
  showAnimation = true,
  className,
}: DialogAdapterProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

DialogAdapter.displayName = 'DialogAdapter'

export interface LoadingDialogProps {
  open: boolean
  title?: string
  message?: string
}

export const LoadingDialog = ({ open, title = 'Loading...', message }: LoadingDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

LoadingDialog.displayName = 'LoadingDialog'

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

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
}: ConfirmDialogProps) => {
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
      <DialogContent>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              variant={destructive ? 'destructive' : 'default'}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

ConfirmDialog.displayName = 'ConfirmDialog'
