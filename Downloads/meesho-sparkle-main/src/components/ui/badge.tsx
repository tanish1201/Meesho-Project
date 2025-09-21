import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        outline: "text-foreground",
        // Meesho-specific status badges
        approved: "border-transparent bg-success text-success-foreground",
        needs_edit: "border-transparent bg-warning text-warning-foreground",
        needs_change: "border-transparent bg-destructive text-destructive-foreground",
        ai_generated: "border-transparent bg-primary text-primary-foreground",
        quality_edit: "border-transparent bg-blue-500 text-white",
        high_relevance: "border-transparent bg-green-600 text-white",
        on_model: "border-transparent bg-purple-500 text-white",
        flat_lay: "border-transparent bg-gray-500 text-white",
        cluttered: "border-transparent bg-orange-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }