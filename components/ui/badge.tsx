import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1",
    "overflow-hidden rounded-xs border border-transparent px-2 py-0.5",
    "text-[11px] font-medium uppercase tracking-wider whitespace-nowrap",
    "transition-colors duration-(--dur-fast) ease-(--ease-out)",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-ink text-canvas",
        secondary: "bg-subtle text-ink-secondary border-line",
        destructive: "bg-status-danger/12 text-status-danger border-status-danger/30",
        outline: "bg-transparent border-line-strong text-ink-secondary",
        ghost: "bg-transparent text-ink-muted hover:bg-subtle",
        accent: "bg-accent-subtle text-accent border-accent/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
