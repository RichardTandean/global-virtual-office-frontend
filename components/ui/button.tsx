import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center gap-2",
    "whitespace-nowrap rounded-sm border border-transparent",
    "text-[13px] font-medium leading-none",
    "transition-[background,border-color,color,box-shadow,transform]",
    "duration-(--dur-base) ease-(--ease-out)",
    "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-canvas",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm",
        outline:
          "border-line-strong bg-transparent text-ink hover:bg-subtle hover:border-line-strong",
        secondary:
          "bg-elevated text-ink hover:bg-subtle border-line",
        ghost: "bg-transparent text-ink-secondary hover:bg-subtle hover:text-ink",
        destructive:
          "bg-status-danger/10 text-status-danger hover:bg-status-danger/20 border-status-danger/30",
        link: "text-accent underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        default: "h-9 px-3.5",
        xs: "h-6 px-2 text-[11px] rounded-xs",
        sm: "h-7 px-2.5 text-[12px]",
        lg: "h-10 px-5 text-sm",
        icon: "size-9",
        "icon-xs": "size-6 rounded-xs",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
