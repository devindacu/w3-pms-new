import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
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
  forceDialog?: boolean
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
  forceDialog = false,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile()
  const useSheet = isMobile && !forceDialog && (size === 'sm' || size === 'md')

  if (useSheet) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className={cn('max-h-[90vh] flex flex-col p-0', className)}
        >
          <SheetHeader className={cn('p-4 pb-3 border-b shrink-0', headerClassName)}>
            <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
            {description && <SheetDescription className="text-xs">{description}</SheetDescription>}
          </SheetHeader>
          
          <div className={cn('overflow-y-auto flex-1 p-4', bodyClassName)}>
            {children}
          </div>
          
          {footer && (
            <SheetFooter className={cn('p-4 pt-3 border-t shrink-0', footerClassName)}>
              {footer}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    )
  }

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
