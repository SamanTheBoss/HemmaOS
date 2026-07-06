import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-accent to-violet text-white shadow-lg shadow-violet/25 hover:shadow-violet/40 hover:brightness-110",
        success:
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:brightness-110",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:brightness-110",
        outline:
          "border border-line bg-white/[.03] text-slate-300 hover:bg-white/[.06] hover:border-[#343a52]",
        ghost: "text-slate-300 hover:bg-white/[.06]",
        secondary:
          "border border-violet/40 bg-violet/10 text-violet-300 hover:bg-violet/20 hover:border-violet/60",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
