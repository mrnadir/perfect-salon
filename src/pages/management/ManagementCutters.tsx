import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Pencil, Trash2, UserPlus, X } from 'lucide-react'
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
import { useData } from '../../context/DataContext'
import type { Cutter } from '../../types'
import {
  btnGhost,
  btnPrimary,
  btnSecondary,
  Field,
  inputClass,
  SectionCard,
  selectClass,
} from '../../components/ui'

const emptyForm = {
  name: '',
  phone: '',
  active: true,
}

export function ManagementCutters() {
  const { cutters, addCutter, updateCutter, deleteCutter } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Cutter | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setOpen(true)
  }

  function openEdit(c: Cutter) {
    setEditingId(c.id)
    setForm({
      name: c.name,
      phone: c.phone || '',
      active: c.active,
    })
    setError(null)
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  function openDelete(c: Cutter) {
    setDeleteTarget(c)
    setDeleteError(null)
  }

  function closeDelete() {
    if (deleting) return
    setDeleteTarget(null)
    setDeleteError(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    const err = await deleteCutter(deleteTarget.id)
    setDeleting(false)
    if (err) {
      setDeleteError(err)
      return
    }
    setDeleteTarget(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      name: form.name,
      phone: form.phone,
      active: form.active,
    }

    const err = editingId
      ? await updateCutter(editingId, payload)
      : await addCutter(payload)

    if (err) {
      setError(err)
      return
    }

    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-primary">
            Cutters
          </h1>
          <p className="mt-1 text-text-muted">
            Manage cutter profiles for Executive Desk
          </p>
        </div>

        <button type="button" onClick={openAdd} className={btnPrimary}>
          <UserPlus className="h-4 w-4" />
          Add cutter
        </button>
      </div>

      <SectionCard title="All cutters" description={`${cutters.length} total`}>
        {cutters.length === 0 ? (
          <p className="text-sm text-text-muted">No cutters yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {cutters.map((c) => (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="py-3 text-text">{c.name}</td>
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
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className={btnSecondary}
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className={btnGhost}
                          onClick={() => openDelete(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <CutterFormModal
        open={open}
        editing={Boolean(editingId)}
        form={form}
        error={error}
        onClose={closeModal}
        onChange={setForm}
        onSubmit={onSubmit}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        eyebrow="Delete cutter"
        message={
          <>
            Delete{' '}
            <span className="font-semibold text-text">
              {deleteTarget?.name}
            </span>
            ? This cannot be undone.
          </>
        }
        error={deleteError}
        deleting={deleting}
        onClose={closeDelete}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}

function CutterFormModal({
  open,
  editing,
  form,
  error,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean
  editing: boolean
  form: typeof emptyForm
  error: string | null
  onClose: () => void
  onChange: (form: typeof emptyForm) => void
  onSubmit: (e: FormEvent) => void
}) {
  const titleId = useId()
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => nameRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, editing])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

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
              {editing ? 'Edit cutter' : 'New cutter'}
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-bold text-primary">
              {editing ? 'Edit cutter' : 'Add cutter'}
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

        <form onSubmit={onSubmit} className="grid gap-4">
          <Field label="Cutter name">
            <input
              ref={nameRef}
              className={inputClass}
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => onChange({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <select
              className={selectClass}
              value={form.active ? 'active' : 'inactive'}
              onChange={(e) =>
                onChange({ ...form, active: e.target.value === 'active' })
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>

          {error ? (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button type="submit" className={`${btnPrimary} flex-1`}>
              {editing ? (
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
      </div>
    </div>
  )
}
