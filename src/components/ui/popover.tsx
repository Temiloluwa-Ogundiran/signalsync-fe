import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  portalled = true,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  portalled?: boolean
}) {
  const content = (
    <PopoverPrimitive.Content
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-modal w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className,
      )}
      {...props}
    />
  )

  return portalled ? (
    <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>
  ) : (
    content
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }

