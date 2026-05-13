"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-3 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-ink-secondary group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "rounded-md p-[3px] bg-subtle border border-line h-9",
        line: "gap-1 bg-transparent border-b border-line w-full justify-start rounded-none",
        ghost: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
        "text-[12px] font-medium text-ink-secondary",
        "transition-all duration-(--dur-fast) ease-(--ease-out)",
        "outline-none focus-visible:ring-2 focus-visible:ring-focus",
        "disabled:pointer-events-none disabled:opacity-50",
        // default (segmented)
        "group-data-[variant=default]/tabs-list:h-7 group-data-[variant=default]/tabs-list:px-3 group-data-[variant=default]/tabs-list:rounded-sm",
        "group-data-[variant=default]/tabs-list:hover:text-ink",
        "group-data-[variant=default]/tabs-list:data-active:bg-elevated group-data-[variant=default]/tabs-list:data-active:text-ink group-data-[variant=default]/tabs-list:data-active:shadow-sm",
        // line variant (underline)
        "group-data-[variant=line]/tabs-list:px-1 group-data-[variant=line]/tabs-list:py-2.5",
        "group-data-[variant=line]/tabs-list:hover:text-ink",
        "group-data-[variant=line]/tabs-list:data-active:text-ink",
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:inset-x-0 group-data-[variant=line]/tabs-list:after:-bottom-px group-data-[variant=line]/tabs-list:after:h-px group-data-[variant=line]/tabs-list:after:bg-accent group-data-[variant=line]/tabs-list:after:opacity-0 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        // ghost variant (chips)
        "group-data-[variant=ghost]/tabs-list:px-3 group-data-[variant=ghost]/tabs-list:py-1.5 group-data-[variant=ghost]/tabs-list:rounded-pill",
        "group-data-[variant=ghost]/tabs-list:hover:bg-subtle group-data-[variant=ghost]/tabs-list:hover:text-ink",
        "group-data-[variant=ghost]/tabs-list:data-active:bg-accent-subtle group-data-[variant=ghost]/tabs-list:data-active:text-accent",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-[13px] outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
