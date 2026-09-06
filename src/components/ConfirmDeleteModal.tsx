import { useEffect, useId, type ReactNode } from 'react'
import { Trash2, X } from 'lucide-react'

export function ConfirmDeleteModal({
  open,
  eyebrow = 'Delete',
  title = 'Confirm delete',
  message,
  error,
  deleting = false,
  onClose,
  onConfirm,
}: {
  open: boolean
  eyebrow?: string
  title?: string
  message: ReactNode
  error?: string | null
  deleting?: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleting) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, deleting, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-[2px]"
      onClick={() => {
        if (!deleting) onClose()
      }}
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
            <p className="text-xs font-semibold uppercase tracking-wide text-danger">
              {eyebrow}
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-bold text-primary">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-muted hover:text-primary disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-sm text-text-muted">{message}</div>

        {error ? (
          <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
