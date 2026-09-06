import { useState, type FormEvent } from 'react'
import { Pencil, UserPlus } from 'lucide-react'
import { useData } from '../../context/DataContext'
import type { Cutter } from '../../types'
import {
  btnPrimary,
  btnSecondary,
  Field,
  inputClass,
  SectionCard,
} from '../../components/ui'

const emptyForm = {
  name: '',
  phone: '',
  specialty: '',
  notes: '',
  active: true,
}

export function ManagementCutters() {
  const { cutters, addCutter, updateCutter } = useData()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  function startEdit(c: Cutter) {
    setEditingId(c.id)
    setForm({
      name: c.name,
      phone: c.phone || '',
      specialty: c.specialty || '',
      notes: c.notes || '',
      active: c.active,
    })
    setError(null)
    setOk(null)
  }

  function reset() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setOk(null)
    const payload = {
      name: form.name,
      phone: form.phone,
      specialty: form.specialty,
      notes: form.notes,
      active: form.active,
    }

    const err = editingId
      ? await updateCutter(editingId, payload)
      : await addCutter(payload)

    if (err) {
      setError(err)
      return
    }

    setError(null)
    setOk(editingId ? 'Cutter updated' : 'Cutter added')
    reset()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-primary">
          Cutters
        </h1>
        <p className="mt-1 text-text-muted">Add new cutters or edit profiles</p>
      </div>

      <SectionCard
        title={editingId ? 'Edit cutter' : 'Add cutter'}
        description={
          editingId
            ? 'Update cutter details then save'
            : 'New cutters appear on Executive Desk'
        }
        action={
          editingId ? (
            <button type="button" className={btnSecondary} onClick={reset}>
              Cancel edit
            </button>
          ) : null
        }
      >
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Cutter name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Specialty">
            <input
              className={inputClass}
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              placeholder="Haircut, beard, color..."
            />
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              value={form.active ? 'active' : 'inactive'}
              onChange={(e) =>
                setForm({ ...form, active: e.target.value === 'active' })
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                className={`${inputClass} min-h-20`}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
          </div>

          {error ? (
            <p className="sm:col-span-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          {ok ? (
            <p className="sm:col-span-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              {ok}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <button type="submit" className={btnPrimary}>
              {editingId ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Save changes
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add cutter
                </>
              )}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="All cutters" description={`${cutters.length} total`}>
        {cutters.length === 0 ? (
          <p className="text-sm text-text-muted">No cutters yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Specialty</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {cutters.map((c) => (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="py-3 text-text">{c.name}</td>
                    <td className="py-3 text-text-muted">
                      {c.specialty || '—'}
                    </td>
                    <td className="py-3 text-text-muted">{c.phone || '—'}</td>
                    <td className="py-3">
                      <span
                        className={
                          c.active ? 'text-success' : 'text-text-muted'
                        }
                      >
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className={btnSecondary}
                        onClick={() => startEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
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
