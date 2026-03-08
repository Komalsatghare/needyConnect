import React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-950 disabled:pointer-events-none disabled:opacity-50",
                {
                    "bg-primary-600 text-white hover:bg-primary-700 shadow-sm": variant === "default",
                    "bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm": variant === "destructive",
                    "border border-border bg-transparent shadow-sm hover:bg-slate-100": variant === "outline",
                    "hover:bg-slate-100 text-slate-900": variant === "ghost",
                    "h-9 px-4 py-2": size === "default",
                    "h-8 rounded-md px-3 text-xs": size === "sm",
                    "h-10 rounded-md px-8": size === "lg",
                    "h-9 w-9": size === "icon",
                },
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }
