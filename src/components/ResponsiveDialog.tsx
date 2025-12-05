import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { getDialogContentClass, getDialogBodyClass, type DialogSize, type DialogHeight } from '@/lib/dialog-config'

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: DialogSize
  height?: DialogHeight
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'lg',
  height = 'auto',
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}: ResponsiveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(getDialogContentClass(size, height), className)}>
        <DialogHeader className={cn('dialog-header-fixed', headerClassName)}>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className={cn(getDialogBodyClass(height), 'dialog-body-scrollable', bodyClassName)}>
          {children}
        </div>
        
        {footer && (
          <DialogFooter className={cn('dialog-footer-fixed', footerClassName)}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
