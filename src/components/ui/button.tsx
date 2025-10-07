import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold font-heading ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-gold hover:scale-105 transition-smooth shadow-md hover:shadow-gold",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-smooth",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground transition-smooth",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-smooth",
        ghost: "hover:bg-accent hover:text-accent-foreground transition-smooth",
        link: "text-primary underline-offset-4 hover:underline transition-smooth font-normal",
        gold: "bg-gold text-primary shadow-gold hover:bg-gold-dark hover:scale-105 transition-smooth",
        luxury: "bg-primary text-primary-foreground border-2 border-gold hover:bg-gold hover:text-primary transition-smooth",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4",
        lg: "h-14 rounded-xl px-10 text-base",
        icon: "h-12 w-12",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
