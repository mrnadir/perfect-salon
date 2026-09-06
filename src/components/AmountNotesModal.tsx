import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'

type ModalKind = 'income' | 'expense'

export function AmountNotesModal({
  open,
  kind,
  cutterName,
  onClose,
  onSubmit,
}: {
  open: boolean
  kind: ModalKind
  cutterName: string
  onClose: () => void
  onSubmit: (data: { amount: number; note: string }) => void
}) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const titleId = useId()
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setAmount('')
    setNote('')
    const t = window.setTimeout(() => amountRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, kind, cutterName])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const isIncome = kind === 'income'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return
    onSubmit({ amount: value, note: note.trim() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-border bg-bg p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {isIncome ? 'Add income' : 'Add expense'}
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-bold text-primary">
              {cutterName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-muted hover:text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-text-muted">
              Amount (৳)
            </span>
            <input
              ref={amountRef}
              type="number"
              min="1"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-text outline-none transition focus:border-accent focus:bg-bg"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-text-muted">Notes</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Optional note..."
              className="w-full resize-none rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-text outline-none transition focus:border-accent focus:bg-bg"
            />
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={[
                'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                isIncome
                  ? 'bg-accent text-primary hover:brightness-105'
                  : 'bg-navy text-white hover:bg-primary',
              ].join(' ')}
            >
              {isIncome ? 'Save income' : 'Save expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
