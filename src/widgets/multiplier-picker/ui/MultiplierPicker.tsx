import {
  createDartHit,
  formatDartHit,
  type DartHit,
  type WedgeSelection,
} from '@/entities/dart-sector'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib'

interface MultiplierPickerProps {
  selection: WedgeSelection | null
  onConfirm: (hit: DartHit) => void
  onCancel: () => void
  disabled?: boolean
  className?: string
}

export function MultiplierPicker({
  selection,
  onConfirm,
  onCancel,
  disabled = false,
  className,
}: MultiplierPickerProps) {
  if (!selection || selection.kind === 'miss') {
    return null
  }

  if (selection.kind === 'bull') {
    return (
      <div
        className={cn(
          'border-t bg-background px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]',
          className,
        )}
      >
        <p className="mb-3 text-center text-sm font-medium">Центр</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="lg"
            className="h-14 text-lg"
            disabled={disabled}
            onClick={() => onConfirm(createDartHit(25, 'single'))}
          >
            {formatDartHit(createDartHit(25, 'single'))}
          </Button>
          <Button
            size="lg"
            className="h-14 text-lg"
            disabled={disabled}
            onClick={() => onConfirm(createDartHit(50, 'single'))}
          >
            {formatDartHit(createDartHit(50, 'single'))}
          </Button>
        </div>
        <Button
          variant="outline"
          className="mt-2 h-11 w-full"
          disabled={disabled}
          onClick={onCancel}
        >
          Отмена
        </Button>
      </div>
    )
  }

  const { sector } = selection

  return (
    <div
      className={cn(
        'border-t bg-background px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      <p className="mb-3 text-center text-sm font-medium">Сектор {sector}</p>
      <div className="grid grid-cols-3 gap-2">
        <Button
          size="lg"
          className="h-14 text-lg"
          disabled={disabled}
          onClick={() => onConfirm(createDartHit(sector, 'single'))}
        >
          {formatDartHit(createDartHit(sector, 'single'))}
        </Button>
        <Button
          size="lg"
          className="h-14 text-lg"
          disabled={disabled}
          onClick={() => onConfirm(createDartHit(sector, 'double'))}
        >
          {formatDartHit(createDartHit(sector, 'double'))}
        </Button>
        <Button
          size="lg"
          className="h-14 text-lg"
          disabled={disabled}
          onClick={() => onConfirm(createDartHit(sector, 'triple'))}
        >
          {formatDartHit(createDartHit(sector, 'triple'))}
        </Button>
      </div>
      <Button
        variant="outline"
        className="mt-2 h-11 w-full"
        disabled={disabled}
        onClick={onCancel}
      >
        Отмена
      </Button>
    </div>
  )
}
