import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { currentMonth, formatMoney } from '../../lib/utils'
import {
  btnGhost,
  btnPrimary,
  Field,
  inputClass,
  SectionCard,
  StatCard,
} from '../../components/ui'

export function ManagementMonthly() {
  const { monthlyCosts, shopExpenses, expenses, addMonthlyCost, deleteMonthlyCost } =
    useData()
  const [month, setMonth] = useState(currentMonth())
  const [open, setOpen] = useState(false)

  const monthRows = useMemo(
    () => monthlyCosts.filter((m) => m.month === month),
    [monthlyCosts, month],
  )

  const rentTotal = monthRows
    .filter((m) => m.kind === 'rent')
    .reduce((s, m) => s + m.amount, 0)
  const otherMonthly = monthRows
    .filter((m) => m.kind === 'other')
    .reduce((s, m) => s + m.amount, 0)

  const shopInMonth = useMemo(
    () =>
      shopExpenses
        .filter((e) => e.date.startsWith(month))
        .reduce((s, e) => s + e.amount, 0),
    [shopExpenses, month],
  )

  const cutterExpInMonth = useMemo(
    () =>
      expenses
        .filter((e) => e.date.startsWith(month))
        .reduce((s, e) => s + e.amount, 0),
    [expenses, month],
  )

  const grandTotal = rentTotal + otherMonthly + shopInMonth + cutterExpInMonth

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-primary">
            Shop Rent + Monthly Expense
          </h1>
          <p className="mt-1 text-text-muted">
            Fixed monthly costs plus totals for the selected month
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label="Month">
            <input
              type="month"
              className={`${inputClass} max-w-xs`}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </Field>
          <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
            <Plus className="h-4 w-4" />
            Add rent / monthly
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Shop rent" value={formatMoney(rentTotal)} />
        <StatCard
          label="Other monthly fixed"
          value={formatMoney(otherMonthly)}
        />
        <StatCard
          label="Shop + cutter expenses"
          value={formatMoney(shopInMonth + cutterExpInMonth)}
          tone="warn"
        />
        <StatCard
          label="Total monthly expense"
          value={formatMoney(grandTotal)}
          tone="warn"
        />
      </div>

      <SectionCard
        title={`Fixed costs — ${month}`}
        description={`${monthRows.length} entries`}
      >
        {monthRows.length === 0 ? (
          <p className="text-sm text-text-muted">No fixed costs for this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Label</th>
                  <th className="pb-3 font-medium">Note</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {monthRows.map((m) => (
                  <tr key={m.id} className="border-b border-border/60">
                    <td className="py-3 text-text-muted">
                      {m.kind === 'rent' ? 'Rent' : 'Other'}
                    </td>
                    <td className="py-3 text-text">{m.label}</td>
                    <td className="py-3 text-text-muted">{m.note || '—'}</td>
                    <td className="py-3 text-right text-danger">
                      {formatMoney(m.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className={btnGhost}
                        onClick={() => deleteMonthlyCost(m.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <AddMonthlyCostModal
        open={open}
        month={month}
        onClose={() => setOpen(false)}
        onSubmit={(data) => {
          addMonthlyCost(data)
          setOpen(false)
        }}
      />
    </div>
  )
}

function AddMonthlyCostModal({
  open,
  month,
  onClose,
  onSubmit,
}: {
  open: boolean
  month: string
  onClose: () => void
  onSubmit: (data: {
    label: string
    amount: number
    month: string
    kind: 'rent' | 'other'
    note: string
  }) => void
}) {
  const [label, setLabel] = useState('Shop Rent')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState<'rent' | 'other'>('rent')
  const [note, setNote] = useState('')
  const titleId = useId()
  const labelRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setKind('rent')
    setLabel('Shop Rent')
    setAmount('')
    setNote('')
    const t = window.setTimeout(() => labelRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

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
    if (!value || value <= 0 || !label.trim()) return
    onSubmit({
      label: label.trim(),
      amount: value,
      month,
      kind,
      note: note.trim(),
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-bg p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Monthly cost
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-bold text-primary">
              Add rent / monthly cost
            </h2>
            <p className="mt-1 text-sm text-text-muted">For {month}</p>
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

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <select
              className={inputClass}
              value={kind}
              onChange={(e) => {
                const next = e.target.value as 'rent' | 'other'
                setKind(next)
                if (next === 'rent') setLabel('Shop Rent')
                else if (label === 'Shop Rent') setLabel('')
              }}
            >
              <option value="rent">Shop Rent</option>
              <option value="other">Other monthly</option>
            </select>
          </Field>
          <Field label="Label">
            <input
              ref={labelRef}
              className={inputClass}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </Field>
          <Field label="Amount (BDT)">
            <input
              type="number"
              min="1"
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Field>
          <Field label="Note">
            <input
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <div className="flex gap-2 pt-1 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button type="submit" className={`${btnPrimary} flex-1`}>
              <Plus className="h-4 w-4" />
              Add for {month}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
