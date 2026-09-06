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

export function ManagementShopExpenses() {
  const { cutters, shopExpenses, deleteShopExpense, deleteShopExpenses } =
    useData()
  const [dateFilter, setDateFilter] = useState('')
  const [cutterFilter, setCutterFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const [busy, setBusy] = useState(false)

  const cutterName = useMemo(() => {
    const map = new Map(cutters.map((c) => [c.id, c.name]))
    return (id?: string) => (id ? map.get(id) : undefined) || '—'
  }, [cutters])

  const filtered = useMemo(
    () =>
      shopExpenses.filter(
        (e) =>
          (cutterFilter === 'all' || e.addedByCutterId === cutterFilter) &&
          (!dateFilter || e.date === dateFilter),
      ),
    [shopExpenses, cutterFilter, dateFilter],
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
      const key = e.addedByCutterId || 'unknown'
      map.set(key, (map.get(key) || 0) + e.amount)
    }
    return [...map.entries()]
      .map(([id, amount]) => ({
        id,
        name: id === 'unknown' ? 'Unknown' : cutterName(id),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [filtered, cutterName])

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
        await deleteShopExpense(id)
        setSelected((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        await deleteShopExpenses(pendingDelete.ids)
        setSelected(new Set())
      }
      setPendingDelete(null)
    } finally {
      setBusy(false)
    }
  }

  const deleteMessage =
    pendingDelete?.kind === 'selected'
      ? `Delete ${pendingDelete.ids.length} selected shop expense entries? This cannot be undone.`
      : 'Delete this shop expense entry? This cannot be undone.'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-primary">
            Shop Expense Summary
          </h1>
          <p className="mt-1 text-text-muted">
            Overview of shop expenses — amount, purpose, and who added
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label="Added by">
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

      <StatCard
        label="Filtered shop expense"
        value={formatMoney(total)}
        tone="warn"
      />

      <SectionCard title="By cutter">
        {byCutter.length === 0 ? (
          <p className="text-sm text-text-muted">No data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Added by</th>
                  <th className="pb-3 font-medium text-right">Total expense</th>
                </tr>
              </thead>
              <tbody>
                {byCutter.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="py-3 text-text">{row.name}</td>
                    <td className="py-3 text-right font-medium text-primary">
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
        title="All shop expenses"
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
                      aria-label="Select all shop expenses"
                    />
                  </th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Purpose / Notes</th>
                  <th className="pb-3 font-medium">Added by</th>
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
                        aria-label={`Select shop expense ${e.date}`}
                      />
                    </td>
                    <td className="py-3 text-text-muted">{e.date}</td>
                    <td className="py-3 font-medium text-primary">
                      {formatMoney(e.amount)}
                    </td>
                    <td className="py-3 text-text">{e.note || '—'}</td>
                    <td className="py-3 text-text-muted">
                      {cutterName(e.addedByCutterId)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className={btnGhost}
                        disabled={busy}
                        onClick={() =>
                          setPendingDelete({ kind: 'one', id: e.id })
                        }
                        aria-label="Delete shop expense"
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
        eyebrow="Delete shop expense"
        message={deleteMessage}
        deleting={busy}
        onClose={closeDelete}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
