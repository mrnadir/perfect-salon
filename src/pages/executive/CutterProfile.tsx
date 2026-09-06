import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { formatMoney, todayISO } from '../../lib/utils'
import {
  btnGhost,
  btnPrimary,
  Field,
  inputClass,
  SectionCard,
  StatCard,
} from '../../components/ui'

const EXPENSE_CATEGORIES = [
  'Products',
  'Tools',
  'Transport',
  'Food',
  'Other',
]

export function CutterProfile() {
  const { id } = useParams()
  const {
    cutters,
    incomes,
    expenses,
    addIncome,
    addExpense,
    deleteIncome,
    deleteExpense,
  } = useData()

  const cutter = cutters.find((c) => c.id === id)
  const today = todayISO()

  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeNote, setIncomeNote] = useState('')
  const [incomeDate, setIncomeDate] = useState(today)

  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState(EXPENSE_CATEGORIES[0])
  const [expNote, setExpNote] = useState('')
  const [expDate, setExpDate] = useState(today)

  const mineIncome = useMemo(
    () => incomes.filter((i) => i.cutterId === id),
    [incomes, id],
  )
  const mineExpense = useMemo(
    () => expenses.filter((e) => e.cutterId === id),
    [expenses, id],
  )

  const todayIncome = mineIncome
    .filter((i) => i.date === today)
    .reduce((s, i) => s + i.amount, 0)
  const todayExpense = mineExpense
    .filter((e) => e.date === today)
    .reduce((s, e) => s + e.amount, 0)

  if (!cutter || !cutter.active) {
    return <Navigate to="/" replace />
  }

  function onIncome(e: FormEvent) {
    e.preventDefault()
    const amount = Number(incomeAmount)
    if (!amount || amount <= 0) return
    addIncome({
      cutterId: cutter!.id,
      amount,
      note: incomeNote,
      date: incomeDate,
    })
    setIncomeAmount('')
    setIncomeNote('')
    setIncomeDate(today)
  }

  function onExpense(e: FormEvent) {
    e.preventDefault()
    const amount = Number(expAmount)
    if (!amount || amount <= 0) return
    addExpense({
      cutterId: cutter!.id,
      amount,
      category: expCategory,
      note: expNote,
      date: expDate,
    })
    setExpAmount('')
    setExpNote('')
    setExpCategory(EXPENSE_CATEGORIES[0])
    setExpDate(today)
  }

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Executive Desk
      </Link>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-accent">Cutter profile</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-primary">
          {cutter.name}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {cutter.phone || 'No phone number'}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Today income"
          value={formatMoney(todayIncome)}
          tone="good"
        />
        <StatCard
          label="Today expense"
          value={formatMoney(todayExpense)}
          tone="warn"
        />
        <StatCard
          label="Today net"
          value={formatMoney(todayIncome - todayExpense)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Daily income" description="Add today's earnings">
          <form onSubmit={onIncome} className="space-y-3">
            <Field label="Amount (BDT)">
              <input
                type="number"
                min="1"
                className={inputClass}
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                required
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                className={inputClass}
                value={incomeDate}
                onChange={(e) => setIncomeDate(e.target.value)}
                required
              />
            </Field>
            <Field label="Note">
              <input
                className={inputClass}
                value={incomeNote}
                onChange={(e) => setIncomeNote(e.target.value)}
                placeholder="Haircut, beard trim..."
              />
            </Field>
            <button type="submit" className={btnPrimary}>
              <Plus className="h-4 w-4" />
              Add income
            </button>
          </form>

          <div className="mt-6 space-y-2">
            {mineIncome.length === 0 ? (
              <p className="text-sm text-text-muted">No income yet.</p>
            ) : (
              mineIncome.slice(0, 10).map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="text-text">{i.note || 'Income'}</p>
                    <p className="text-xs text-text-muted">{i.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-success">
                      {formatMoney(i.amount)}
                    </span>
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => deleteIncome(i.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Daily expense" description="Add cutter expenses">
          <form onSubmit={onExpense} className="space-y-3">
            <Field label="Amount (BDT)">
              <input
                type="number"
                min="1"
                className={inputClass}
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                required
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                className={inputClass}
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                required
              />
            </Field>
            <Field label="Category">
              <select
                className={inputClass}
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Note">
              <input
                className={inputClass}
                value={expNote}
                onChange={(e) => setExpNote(e.target.value)}
                placeholder="Optional"
              />
            </Field>
            <button type="submit" className={btnPrimary}>
              <Plus className="h-4 w-4" />
              Add expense
            </button>
          </form>

          <div className="mt-6 space-y-2">
            {mineExpense.length === 0 ? (
              <p className="text-sm text-text-muted">No expenses yet.</p>
            ) : (
              mineExpense.slice(0, 10).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="text-text">
                      {e.category}
                      {e.note ? ` · ${e.note}` : ''}
                    </p>
                    <p className="text-xs text-text-muted">{e.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-danger">
                      {formatMoney(e.amount)}
                    </span>
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => deleteExpense(e.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
