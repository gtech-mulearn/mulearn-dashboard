import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-secondary border border-[#0054E8] shadow-[inset_0px_6px_11px_0px_rgba(255,255,255,0.33),inset_0px_-6px_17px_0px_rgba(0,0,0,0.18),0px_4px_7px_0px_rgba(0,0,0,0.18)] hover:opacity-95 rounded-full font-sans",
        destructive:
          "bg-destructive text-secondary hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 border-primary text-primary hover:bg-primary/10 font-bold cursor-pointer   transition-all duration-300",
        secondary:
          "bg-secondary text-[#1a1a1a] hover:bg-[#a3a3a3] border border-secondary transition-all duration-300 font-bold cursor-pointer ",
        ghost:
          "text-transparent bg-linear-to-r from-[#6366f1] to-[#2E85FE] bg-clip-text hover:bg-[#6366f1]/10 transition-all font-bold cursor-pointer duration-300",
        link: "text-primary underline-offset-4 hover:underline",
        blue: "bg-primary text-secondary rounded-full text-base hover:bg-mulearn-duke-purple active:bg-primary transition-all duration-300 font-bold cursor-pointer  rounded-full cursor-pointer",
        inverted:
          "bg-secondary text-primary hover:bg-secondary/90 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 font-bold cursor-pointer ",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
