import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import { currentMonth, formatMoney } from '../../lib/utils'
import { Field, inputClass } from '../../components/ui'

type DayRow = {
  date: string
  label: string
  byCutter: Record<string, { income: number; cost: number }>
}

function dayLabel(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  const day = d.getDate()
  const mon = d.toLocaleString('en-US', { month: 'short' })
  const yy = String(d.getFullYear()).slice(-2)
  return `${day}/${mon}/${yy}`
}

function daysInMonth(month: string) {
  const [y, m] = month.split('-').map(Number)
  if (!y || !m) return []
  const count = new Date(y, m, 0).getDate()
  return Array.from({ length: count }, (_, i) => {
    const day = String(i + 1).padStart(2, '0')
    return `${month}-${day}`
  })
}

function moneyOrDash(amount: number) {
  return amount > 0 ? formatMoney(amount) : '—'
}

export function ManagementAnalytics() {
  const { cutters, incomes, expenses } = useData()
  const [month, setMonth] = useState(currentMonth())

  const cutterCols = useMemo(
    () =>
      [...cutters].sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1
        return a.name.localeCompare(b.name)
      }),
    [cutters],
  )

  const rows = useMemo(() => {
    const dayMap = new Map<string, DayRow>()

    for (const date of daysInMonth(month)) {
      dayMap.set(date, {
        date,
        label: dayLabel(date),
        byCutter: Object.fromEntries(
          cutterCols.map((c) => [c.id, { income: 0, cost: 0 }]),
        ),
      })
    }

    for (const i of incomes) {
      if (!i.date.startsWith(month)) continue
      const row = dayMap.get(i.date)
      if (!row) continue
      if (!row.byCutter[i.cutterId]) {
        row.byCutter[i.cutterId] = { income: 0, cost: 0 }
      }
      row.byCutter[i.cutterId].income += i.amount
    }

    for (const e of expenses) {
      if (!e.date.startsWith(month)) continue
      const row = dayMap.get(e.date)
      if (!row) continue
      if (!row.byCutter[e.cutterId]) {
        row.byCutter[e.cutterId] = { income: 0, cost: 0 }
      }
      row.byCutter[e.cutterId].cost += e.amount
    }

    return [...dayMap.values()]
  }, [incomes, expenses, month, cutterCols])

  const totals = useMemo(() => {
    const map: Record<string, { income: number; cost: number }> = {}
    for (const c of cutterCols) {
      map[c.id] = { income: 0, cost: 0 }
    }
    for (const row of rows) {
      for (const c of cutterCols) {
        const cell = row.byCutter[c.id]
        if (!cell) continue
        map[c.id].income += cell.income
        map[c.id].cost += cell.cost
      }
    }
    return map
  }, [rows, cutterCols])

  function netFor(cutterId: string) {
    const t = totals[cutterId] ?? { income: 0, cost: 0 }
    return t.income * 0.5 - t.cost
  }

  function formatNet(amount: number) {
    const abs = formatMoney(Math.abs(amount))
    if (amount < 0) return `−${abs}`
    return abs
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-primary">
            Analytics
          </h1>
          <p className="mt-1 text-text-muted">
            Date-wise income &amp; cost for every cutter
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
      </div>

      {cutterCols.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-text-muted">
          Add a cutter first to view analytics.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_24px_rgba(26,26,26,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-navy text-white">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-10 border-r border-white/10 bg-navy px-3 py-3 text-left font-semibold sm:px-4"
                  >
                    Date
                  </th>
                  {cutterCols.map((c) => (
                    <th
                      key={c.id}
                      colSpan={2}
                      className="border-l border-white/10 px-3 py-2 text-center font-semibold sm:px-4"
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-border bg-accent-soft text-text-muted">
                  {cutterCols.flatMap((c) => [
                    <th
                      key={`${c.id}-income-h`}
                      className="border-l border-border px-3 py-2 text-right font-medium sm:px-4"
                    >
                      Income
                    </th>,
                    <th
                      key={`${c.id}-cost-h`}
                      className="px-3 py-2 text-right font-medium sm:px-4"
                    >
                      Cost
                    </th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => {
                  const zebra = rowIdx % 2 === 1
                  return (
                    <tr
                      key={row.date}
                      className={`border-b border-border/70 ${
                        zebra ? 'bg-surface-muted/60' : 'bg-surface'
                      }`}
                    >
                      <td
                        className={`sticky left-0 z-10 border-r border-border px-3 py-2.5 text-text-muted sm:px-4 ${
                          zebra ? 'bg-surface-muted' : 'bg-surface'
                        }`}
                      >
                        {row.label}
                      </td>
                      {cutterCols.flatMap((c) => {
                        const cell = row.byCutter[c.id] ?? {
                          income: 0,
                          cost: 0,
                        }
                        return [
                          <td
                            key={`${row.date}-${c.id}-income`}
                            className="border-l border-border px-3 py-2.5 text-right tabular-nums text-success sm:px-4"
                          >
                            {moneyOrDash(cell.income)}
                          </td>,
                          <td
                            key={`${row.date}-${c.id}-cost`}
                            className="px-3 py-2.5 text-right tabular-nums text-danger sm:px-4"
                          >
                            {moneyOrDash(cell.cost)}
                          </td>,
                        ]
                      })}
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-accent-soft">
                  <td className="sticky left-0 z-10 border-r border-border bg-accent-soft px-3 py-3 font-bold text-primary sm:px-4">
                    Total
                  </td>
                  {cutterCols.flatMap((c) => {
                    const t = totals[c.id] ?? { income: 0, cost: 0 }
                    return [
                      <td
                        key={`${c.id}-total-income`}
                        className="border-l border-border px-3 py-3 text-right font-bold tabular-nums text-success sm:px-4"
                      >
                        {formatMoney(t.income)}
                      </td>,
                      <td
                        key={`${c.id}-total-cost`}
                        className="px-3 py-3 text-right font-bold tabular-nums text-danger sm:px-4"
                      >
                        {formatMoney(t.cost)}
                      </td>,
                    ]
                  })}
                </tr>
                <tr className="border-t border-border bg-navy text-white">
                  <td className="sticky left-0 z-10 border-r border-white/10 bg-navy px-3 py-3 font-semibold sm:px-4">
                    50% Net
                  </td>
                  {cutterCols.map((c) => {
                    const net = netFor(c.id)
                    return (
                      <td
                        key={`${c.id}-net`}
                        colSpan={2}
                        className="border-l border-white/10 px-3 py-3 text-center font-bold tabular-nums text-accent sm:px-4"
                      >
                        {formatNet(net)}
                      </td>
                    )
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
