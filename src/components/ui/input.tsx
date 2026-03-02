import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const DATE_LIKE_TYPES = new Set(['date', 'datetime-local', 'time', 'month', 'week'])

function Input({ className, type, onClick, ...props }: ComponentProps<"input">) {
  const isDateLike = type !== undefined && DATE_LIKE_TYPES.has(type)
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-sm",
        "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:shadow-lg focus-visible:shadow-primary/20",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "hover:border-primary/50 hover:shadow-md",
        isDateLike ? 'cursor-pointer' : '',
        className
      )}
      onClick={(e) => {
        if (isDateLike) {
          try {
            (e.target as HTMLInputElement).showPicker?.()
          } catch {
            // showPicker may throw if the element is not focused; ignore
          }
        }
        onClick?.(e)
      }}
      {...props}
    />
  )
}

export { Input }
