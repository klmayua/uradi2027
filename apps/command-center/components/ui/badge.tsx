import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-uradi-gold focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-uradi-gold text-uradi-bg-primary hover:bg-uradi-gold-light",
        secondary:
          "border-transparent bg-uradi-bg-tertiary text-uradi-text-primary hover:bg-uradi-bg-tertiary/80",
        destructive:
          "border-transparent bg-uradi-status-critical text-white hover:bg-uradi-status-critical/80",
        outline: "text-uradi-text-primary border-uradi-border",
        success:
          "border-transparent bg-uradi-status-positive/20 text-uradi-status-positive",
        warning:
          "border-transparent bg-uradi-status-warning/20 text-uradi-status-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
