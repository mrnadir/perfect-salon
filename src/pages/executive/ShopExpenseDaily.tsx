import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { todayISO } from '../../lib/utils'
import { btnPrimary, Field, inputClass, selectClass, SectionCard } from '../../components/ui'

export function ShopExpenseDaily() {
  const { cutters, shopExpenses, addShopExpense } = useData()
  const today = todayISO()
  const [open, setOpen] = useState(false)

  const activeCutters = useMemo(
    () => cutters.filter((c) => c.active),
    [cutters],
  )

  const cutterName = useMemo(() => {
    const map = new Map(cutters.map((c) => [c.id, c.name]))
    return (id?: string) => (id ? map.get(id) : undefined) || '—'
  }, [cutters])

  const todayRows = useMemo(
    () => shopExpenses.filter((e) => e.date === today),
    [shopExpenses, today],
  )

  const todayTotal = useMemo(
    () => todayRows.reduce((s, e) => s + e.amount, 0),
    [todayRows],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/"
            className="mb-3 inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cutters
          </Link>
          <h1 className="font-display text-3xl font-semibold text-primary">
            Shop Expense Daily
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Today&apos;s shop spending — who added, why, and how much
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className={btnPrimary}
          disabled={activeCutters.length === 0}
        >
          <Plus className="h-4 w-4" />
          Add Shop Expense
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-[0_8px_24px_rgba(26,26,26,0.04)]">
        <p className="text-[11px] font-bold tracking-wide text-text-muted uppercase">
          Today total
        </p>
        <p className="mt-1 text-2xl font-bold text-primary">
          ৳{todayTotal.toLocaleString('en-BD')}
        </p>
      </div>

      {activeCutters.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-text-muted">
          Add at least one cutter from Management Desk before logging shop
          expenses.
        </p>
      ) : null}

      <SectionCard
        title="Today's expenses"
        description={`${todayRows.length} entries`}
      >
        {todayRows.length === 0 ? (
          <p className="text-sm text-text-muted">
            No shop expenses for today yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Purpose</th>
                  <th className="pb-3 font-medium">Added by</th>
                </tr>
              </thead>
              <tbody>
                {todayRows.map((e, index) => (
                  <tr key={e.id} className="border-b border-border/70">
                    <td className="py-3 text-text-muted">{index + 1}</td>
                    <td className="py-3 font-semibold text-primary">
                      ৳{e.amount.toLocaleString('en-BD')}
                    </td>
                    <td className="py-3 text-text">{e.note || '—'}</td>
                    <td className="py-3 text-text-muted">
                      {cutterName(e.addedByCutterId)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <AddShopExpenseModal
        open={open}
        cutters={activeCutters}
        onClose={() => setOpen(false)}
        onSubmit={({ amount, note, addedByCutterId }) => {
          addShopExpense({
            amount,
            note,
            addedByCutterId,
            date: today,
          })
          setOpen(false)
        }}
      />
    </div>
  )
}

function AddShopExpenseModal({
  open,
  cutters,
  onClose,
  onSubmit,
}: {
  open: boolean
  cutters: { id: string; name: string }[]
  onClose: () => void
  onSubmit: (data: {
    amount: number
    note: string
    addedByCutterId: string
  }) => void
}) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [cutterId, setCutterId] = useState('')
  const titleId = useId()
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setAmount('')
    setNote('')
    setCutterId(cutters[0]?.id || '')
    const t = window.setTimeout(() => amountRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, cutters])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0 || !cutterId) return
    onSubmit({
      amount: value,
      note: note.trim(),
      addedByCutterId: cutterId,
    })
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
              Shop expense
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-bold text-primary">
              Add Shop Expense
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
          <Field label="Amount (৳)">
            <input
              ref={amountRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/\D/g, ''))
              }
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault()
                }
              }}
              placeholder="0"
              className={inputClass}
            />
          </Field>

          <Field label="Cutter (who is adding)">
            <select
              className={selectClass}
              value={cutterId}
              onChange={(e) => setCutterId(e.target.value)}
              required
            >
              {cutters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Purpose">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              required
              placeholder="e.g. Blade pack, cleaning soap..."
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button type="submit" className={`${btnPrimary} flex-1`}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
