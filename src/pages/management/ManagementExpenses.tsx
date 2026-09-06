import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
import { useData } from '../../context/DataContext'
import { formatMoney } from '../../lib/utils'
import {
  btnGhost,
  Checkbox,
  Field,
  inputClass,
  SectionCard,
  selectClass,
  StatCard,
} from '../../components/ui'

type PendingDelete =
  | { kind: 'one'; id: string }
  | { kind: 'selected'; ids: string[] }

export function ManagementExpenses() {
  const { cutters, expenses, deleteExpense, deleteExpenses } = useData()
  const [cutterFilter, setCutterFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const [busy, setBusy] = useState(false)

  const nameOf = useMemo(() => {
    const map = new Map(cutters.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) || 'Unknown'
  }, [cutters])

  const filtered = useMemo(
    () =>
      expenses.filter(
        (e) =>
          (cutterFilter === 'all' || e.cutterId === cutterFilter) &&
          (!dateFilter || e.date === dateFilter),
      ),
    [expenses, cutterFilter, dateFilter],
  )

  const filteredIds = useMemo(() => filtered.map((e) => e.id), [filtered])

  useEffect(() => {
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => filteredIds.includes(id)))
      return next.size === prev.size ? prev : next
    })
  }, [filteredIds])

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  const byCutter = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of filtered) {
      map.set(e.cutterId, (map.get(e.cutterId) || 0) + e.amount)
    }
    return [...map.entries()]
      .map(([cutterId, amount]) => ({
        cutterId,
        name: nameOf(cutterId),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [filtered, nameOf])

  const hasFilters = cutterFilter !== 'all' || Boolean(dateFilter)
  const allSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0 && !allSelected

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filteredIds))
  }

  function closeDelete() {
    if (busy) return
    setPendingDelete(null)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setBusy(true)
    try {
      if (pendingDelete.kind === 'one') {
        const id = pendingDelete.id
        await deleteExpense(id)
        setSelected((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        await deleteExpenses(pendingDelete.ids)
        setSelected(new Set())
      }
      setPendingDelete(null)
    } finally {
      setBusy(false)
    }
  }

  const deleteMessage =
    pendingDelete?.kind === 'selected'
      ? `Delete ${pendingDelete.ids.length} selected expense entries? This cannot be undone.`
      : 'Delete this expense entry? This cannot be undone.'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-primary">
            Total Expense
          </h1>
          <p className="mt-1 text-text-muted">
            Daily basis expense summary per cutter
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label="Cutter">
            <select
              className={`${selectClass} min-w-[10rem]`}
              value={cutterFilter}
              onChange={(e) => setCutterFilter(e.target.value)}
            >
              <option value="all">All cutters</option>
              {cutters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input
              type="date"
              className={inputClass}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </Field>
          <button
            type="button"
            disabled={!hasFilters}
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-text-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            onClick={() => {
              setCutterFilter('all')
              setDateFilter('')
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <StatCard label="Filtered total expense" value={formatMoney(total)} tone="warn" />

      <SectionCard title="Per cutter totals">
        {byCutter.length === 0 ? (
          <p className="text-sm text-text-muted">No expenses for this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Cutter</th>
                  <th className="pb-3 font-medium text-right">Total expense</th>
                </tr>
              </thead>
              <tbody>
                {byCutter.map((row) => (
                  <tr key={row.cutterId} className="border-b border-border/60">
                    <td className="py-3 text-text">{row.name}</td>
                    <td className="py-3 text-right font-medium text-danger">
                      {formatMoney(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Expense records"
        description={`${filtered.length} entries`}
        action={
          selected.size > 0 ? (
            <button
              type="button"
              className={btnGhost}
              disabled={busy}
              onClick={() =>
                setPendingDelete({ kind: 'selected', ids: [...selected] })
              }
            >
              <Trash2 className="h-4 w-4" />
              Delete selected ({selected.size})
            </button>
          ) : null
        }
      >
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted">No records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="w-10 pb-3 font-medium">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      aria-label="Select all expense records"
                    />
                  </th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Cutter</th>
                  <th className="pb-3 font-medium">Note</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border/60">
                    <td className="py-3">
                      <Checkbox
                        checked={selected.has(e.id)}
                        onChange={() => toggleOne(e.id)}
                        aria-label={`Select expense ${e.date}`}
                      />
                    </td>
                    <td className="py-3 text-text-muted">{e.date}</td>
                    <td className="py-3 text-text">{nameOf(e.cutterId)}</td>
                    <td className="py-3 text-text-muted">{e.note || '—'}</td>
                    <td className="py-3 text-right text-danger">
                      {formatMoney(e.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className={btnGhost}
                        disabled={busy}
                        onClick={() =>
                          setPendingDelete({ kind: 'one', id: e.id })
                        }
                        aria-label="Delete expense"
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

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        eyebrow="Delete expense"
        message={deleteMessage}
        deleting={busy}
        onClose={closeDelete}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
