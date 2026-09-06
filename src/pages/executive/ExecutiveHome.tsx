import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Wallet } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { todayISO } from '../../lib/utils'
import type { Cutter } from '../../types'
import { AmountNotesModal } from '../../components/AmountNotesModal'

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString('en-BD')}`
}

function formatCardDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function initialOf(name: string) {
  return (name.trim().charAt(0) || '?').toUpperCase()
}

type ModalState =
  | { open: false }
  | { open: true; kind: 'income' | 'expense'; cutter: Cutter }

export function ExecutiveHome() {
  const { cutters, incomes, expenses, addIncome, addExpense } = useData()
  const today = todayISO()
  const dateLabel = formatCardDate()
  const [modal, setModal] = useState<ModalState>({ open: false })

  const activeCutters = useMemo(
    () => cutters.filter((c) => c.active),
    [cutters],
  )

  const totalsByCutter = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>()
    for (const c of cutters) {
      if (!c.active) continue
      map.set(c.id, { income: 0, expense: 0 })
    }
    for (const i of incomes) {
      if (i.date !== today) continue
      const row = map.get(i.cutterId)
      if (row) row.income += i.amount
    }
    for (const e of expenses) {
      if (e.date !== today) continue
      const row = map.get(e.cutterId)
      if (row) row.expense += e.amount
    }
    return map
  }, [cutters, incomes, expenses, today])

  const dayTotals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const row of totalsByCutter.values()) {
      income += row.income
      expense += row.expense
    }
    return { income, expense, net: income - expense }
  }, [totalsByCutter])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-sm text-navy">
            <CalendarDays className="h-4 w-4 text-accent" />
            {dateLabel}
          </div>
          <h1 className="font-display text-3xl font-semibold text-primary">
            Today&apos;s cutters
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Quick income & expense for each cutter
          </p>
        </div>

        <Link
          to="/shop-expense"
          className="group inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent-soft px-4 py-2.5 text-sm font-semibold text-navy transition hover:border-accent hover:bg-accent hover:text-primary"
        >
          <Wallet className="h-4 w-4 text-accent transition group-hover:text-primary" />
          Shop Expense
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-accent/20 bg-accent-soft px-4 py-3">
          <p className="text-[11px] font-bold tracking-wide text-navy uppercase">
            Total income
          </p>
          <p className="mt-1 text-2xl font-bold text-accent">
            {formatTaka(dayTotals.income)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-bold tracking-wide text-text-muted uppercase">
            Total expense
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {formatTaka(dayTotals.expense)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-bold tracking-wide text-text-muted uppercase">
            Net
          </p>
          <p className="mt-1 text-2xl font-bold text-navy">
            {formatTaka(dayTotals.net)}
          </p>
        </div>
      </div>

      {activeCutters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
          <p className="text-lg font-semibold text-primary">No cutters yet</p>
          <p className="mt-2 text-sm text-text-muted">
            Add cutters from Management Desk.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activeCutters.map((cutter) => {
            const totals = totalsByCutter.get(cutter.id) || {
              income: 0,
              expense: 0,
            }

            return (
              <article
                key={cutter.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-[0_8px_24px_rgba(26,26,26,0.04)] sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-base font-bold text-accent">
                    {initialOf(cutter.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-primary">
                      {cutter.name}
                    </h2>
                    <p className="truncate text-xs text-text-muted">
                      {cutter.specialty || 'Cutter'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-accent/20 bg-accent-soft px-3 py-2.5">
                    <p className="text-[10px] font-bold tracking-wide text-navy uppercase">
                      Income
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-accent">
                      {formatTaka(totals.income)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted px-3 py-2.5">
                    <p className="text-[10px] font-bold tracking-wide text-text-muted uppercase">
                      Expense
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-primary">
                      {formatTaka(totals.expense)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setModal({ open: true, kind: 'income', cutter })
                    }
                    className="rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-primary transition hover:brightness-105"
                  >
                    + Income
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({ open: true, kind: 'expense', cutter })
                    }
                    className="rounded-xl bg-navy px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary"
                  >
                    + Expense
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <AmountNotesModal
        open={modal.open}
        kind={modal.open ? modal.kind : 'income'}
        cutterName={modal.open ? modal.cutter.name : ''}
        onClose={() => setModal({ open: false })}
        onSubmit={({ amount, note }) => {
          if (!modal.open) return
          if (modal.kind === 'income') {
            addIncome({
              cutterId: modal.cutter.id,
              amount,
              note,
              date: today,
            })
          } else {
            addExpense({
              cutterId: modal.cutter.id,
              amount,
              category: 'Other',
              note,
              date: today,
            })
          }
          setModal({ open: false })
        }}
      />
    </div>
  )
}
