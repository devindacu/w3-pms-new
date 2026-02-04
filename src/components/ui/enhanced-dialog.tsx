import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const EnhancedDialog = DialogPrimitive.Root;

const EnhancedDialogTrigger = DialogPrimitive.Trigger;

const EnhancedDialogPortal = DialogPrimitive.Portal;

const EnhancedDialogClose = DialogPrimitive.Close;

const EnhancedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'transition-all duration-300',
      className
    )}
    {...props}
  />
));
EnhancedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface EnhancedDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
}

const EnhancedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  EnhancedDialogContentProps
>(({ className, children, size = 'md', showCloseButton = true, ...props }, ref) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4',
  };

  return (
    <EnhancedDialogPortal>
      <EnhancedDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50',
          'translate-x-[-50%] translate-y-[-50%]',
          'grid w-full gap-4 border bg-background p-6 shadow-2xl',
          'rounded-lg',
          // Responsive sizing
          'max-h-[95vh] overflow-auto',
          // Mobile optimization
          'sm:max-h-[90vh]',
          // Animations
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'duration-300',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X size={20} weight="bold" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </EnhancedDialogPortal>
  );
});
EnhancedDialogContent.displayName = DialogPrimitive.Content.displayName;

const EnhancedDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      'pb-4 border-b',
      className
    )}
    {...props}
  />
);
EnhancedDialogHeader.displayName = 'EnhancedDialogHeader';

const EnhancedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      'pt-4 border-t',
      'gap-2 sm:gap-0',
      className
    )}
    {...props}
  />
);
EnhancedDialogFooter.displayName = 'EnhancedDialogFooter';

const EnhancedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-2xl font-bold leading-none tracking-tight',
      'text-foreground',
      className
    )}
    {...props}
  />
));
EnhancedDialogTitle.displayName = DialogPrimitive.Title.displayName;

const EnhancedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground mt-2', className)}
    {...props}
  />
));
EnhancedDialogDescription.displayName = DialogPrimitive.Description.displayName;

// Loading Dialog variant
interface LoadingDialogProps {
  open: boolean;
  title?: string;
  description?: string;
}

export function LoadingDialog({ open, title = 'Loading...', description }: LoadingDialogProps) {
  return (
    <EnhancedDialog open={open}>
      <EnhancedDialogContent size="sm" showCloseButton={false}>
        <EnhancedDialogHeader>
          <EnhancedDialogTitle className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            {title}
          </EnhancedDialogTitle>
          {description && <EnhancedDialogDescription>{description}</EnhancedDialogDescription>}
        </EnhancedDialogHeader>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
}

// Confirmation Dialog variant
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <EnhancedDialog open={open} onOpenChange={onOpenChange}>
      <EnhancedDialogContent size="sm">
        <EnhancedDialogHeader>
          <EnhancedDialogTitle>{title}</EnhancedDialogTitle>
          {description && <EnhancedDialogDescription>{description}</EnhancedDialogDescription>}
        </EnhancedDialogHeader>
        <EnhancedDialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={cn(
              'px-4 py-2 rounded-md font-medium',
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {confirmText}
          </button>
        </EnhancedDialogFooter>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
}

export {
  EnhancedDialog,
  EnhancedDialogPortal,
  EnhancedDialogOverlay,
  EnhancedDialogClose,
  EnhancedDialogTrigger,
  EnhancedDialogContent,
  EnhancedDialogHeader,
  EnhancedDialogFooter,
  EnhancedDialogTitle,
  EnhancedDialogDescription,
};
