import React from "react"

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        ...children.props,
        ref,
      })
    }
    return <span ref={ref as React.RefObject<HTMLSpanElement>} {...props}>{children}</span>
  }
)

Slot.displayName = "Slot"