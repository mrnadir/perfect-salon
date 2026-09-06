import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
  const [label, setLabel] = useState('Shop Rent')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState<'rent' | 'other'>('rent')
  const [note, setNote] = useState('')

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

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0 || !label.trim()) return
    addMonthlyCost({
      label,
      amount: value,
      month,
      kind,
      note,
    })
    setAmount('')
    setNote('')
    setLabel(kind === 'rent' ? 'Shop Rent' : '')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-primary">
          Shop Rent + Monthly Expense
        </h1>
        <p className="mt-1 text-text-muted">
          Fixed monthly costs plus totals for the selected month
        </p>
      </div>

      <Field label="Month">
        <input
          type="month"
          className={`${inputClass} max-w-xs`}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </Field>

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

      <SectionCard title="Add rent / monthly cost">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <select
              className={inputClass}
              value={kind}
              onChange={(e) => {
                const next = e.target.value as 'rent' | 'other'
                setKind(next)
                if (next === 'rent' && !label) setLabel('Shop Rent')
              }}
            >
              <option value="rent">Shop Rent</option>
              <option value="other">Other monthly</option>
            </select>
          </Field>
          <Field label="Label">
            <input
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
          <div className="sm:col-span-2">
            <button type="submit" className={btnPrimary}>
              <Plus className="h-4 w-4" />
              Add for {month}
            </button>
          </div>
        </form>
      </SectionCard>

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
    </div>
  )
}
