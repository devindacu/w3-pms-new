import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-primary/30 [a&]:hover:bg-primary/90 [a&]:hover:shadow-lg [a&]:hover:shadow-primary/40 [a&]:hover:scale-105",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-secondary/30 [a&]:hover:bg-secondary/90 [a&]:hover:shadow-lg [a&]:hover:shadow-secondary/40 [a&]:hover:scale-105",
        destructive:
          "border-transparent bg-destructive text-white shadow-destructive/30 [a&]:hover:bg-destructive/90 [a&]:hover:shadow-lg [a&]:hover:shadow-destructive/40 [a&]:hover:scale-105 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground border-border/50 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:border-accent [a&]:hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
