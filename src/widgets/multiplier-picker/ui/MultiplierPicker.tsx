import type { ReactNode } from 'react'

import {
  createDartHit,
  formatDartHit,
  type DartHit,
  type WedgeSelection,
} from '@/entities/dart-sector'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'
import { cn } from '@/shared/lib'

interface MultiplierPickerProps {
  selection: WedgeSelection | null
  onConfirm: (hit: DartHit) => void
  onCancel: () => void
  disabled?: boolean
  className?: string
}

interface HitConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  onCancel: () => void
  className?: string
  children?: ReactNode
  footer?: ReactNode
}

function HitConfirmDialog({
  open,
  title,
  description,
  onCancel,
  className,
  children,
  footer,
}: HitConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel()
        }
      }}
    >
      <DialogContent
        className={cn('max-w-sm gap-5 sm:max-w-md', className)}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="space-y-2 text-center sm:text-center">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-base">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {children ? <div>{children}</div> : null}

        {footer ?? (
          <DialogFooter className="sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full text-base"
              onClick={onCancel}
            >
              Отмена
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function MultiplierPicker({
  selection,
  onConfirm,
  onCancel,
  disabled = false,
  className,
}: MultiplierPickerProps) {
  const open = selection !== null

  if (selection?.kind === 'miss') {
    const missHit = createDartHit('miss', 'miss')

    return (
      <HitConfirmDialog
        open={open}
        title="Записать промах?"
        description="Подтвердите, что дротик не попал в мишень."
        onCancel={onCancel}
        className={className}
        footer={
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              size="lg"
              variant="destructive"
              className="h-14 w-full text-lg"
              disabled={disabled}
              onClick={() => onConfirm(missHit)}
            >
              {formatDartHit(missHit)}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full text-base"
              disabled={disabled}
              onClick={onCancel}
            >
              Отмена
            </Button>
          </DialogFooter>
        }
      />
    )
  }

  if (selection?.kind === 'bull') {
    return (
      <HitConfirmDialog
        open={open}
        title="Центр"
        description="Выберите область попадания."
        onCancel={onCancel}
        className={className}
      >
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            size="lg"
            className="h-16 text-lg"
            disabled={disabled}
            onClick={() => onConfirm(createDartHit(25, 'single'))}
          >
            {formatDartHit(createDartHit(25, 'single'))}
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-16 text-lg"
            disabled={disabled}
            onClick={() => onConfirm(createDartHit(50, 'single'))}
          >
            {formatDartHit(createDartHit(50, 'single'))}
          </Button>
        </div>
      </HitConfirmDialog>
    )
  }

  if (selection?.kind === 'sector') {
    const { sector } = selection

    return (
      <HitConfirmDialog
        open={open}
        title={`Сектор ${sector}`}
        description="Выберите множитель попадания."
        onCancel={onCancel}
        className={className}
      >
        <div className="grid grid-cols-3 gap-3">
          <Button
            type="button"
            size="lg"
            className="h-16 text-lg"
            disabled={disabled}
            onClick={() => onConfirm(createDartHit(sector, 'single'))}
          >
            {formatDartHit(createDartHit(sector, 'single'))}
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-16 text-lg"
            disabled={disabled}
            onClick={() => onConfirm(createDartHit(sector, 'double'))}
          >
            {formatDartHit(createDartHit(sector, 'double'))}
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-16 text-lg"
            disabled={disabled}
            onClick={() => onConfirm(createDartHit(sector, 'triple'))}
          >
            {formatDartHit(createDartHit(sector, 'triple'))}
          </Button>
        </div>
      </HitConfirmDialog>
    )
  }

  return null
}
