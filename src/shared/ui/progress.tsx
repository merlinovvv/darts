import * as React from 'react'

import { cn } from '@/shared/lib'

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const percent =
      max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          'h-2 w-full overflow-hidden rounded-full bg-muted',
          className,
        )}
        {...props}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-hub-green to-hub-gold transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  },
)
Progress.displayName = 'Progress'

export { Progress }
