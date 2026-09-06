import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  deleteCutterRow,
  deleteExpenseRow,
  deleteIncomeRow,
  deleteMonthlyCostRow,
  deleteShopExpenseRow,
  deleteStockRow,
  fetchAllData,
  insertCutter,
  insertExpense,
  insertIncome,
  insertMonthlyCost,
  insertShopExpense,
  insertStockItem,
  patchCutter,
  patchStockItem,
} from '../lib/db'
import { clearLegacyLocalData, todayISO, uid } from '../lib/utils'
import type {
  Cutter,
  CutterExpense,
  CutterIncome,
  MonthlyCost,
  ShopExpense,
  StockItem,
} from '../types'

interface DataContextValue {
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  cutters: Cutter[]
  incomes: CutterIncome[]
  expenses: CutterExpense[]
  shopExpenses: ShopExpense[]
  stock: StockItem[]
  monthlyCosts: MonthlyCost[]
  addCutter: (
    data: Omit<Cutter, 'id' | 'createdAt' | 'active'> & { active?: boolean },
  ) => Promise<string | null>
  updateCutter: (
    id: string,
    data: Partial<Omit<Cutter, 'id' | 'createdAt'>>,
  ) => Promise<string | null>
  deleteCutter: (id: string) => Promise<string | null>
  addIncome: (data: {
    cutterId: string
    amount: number
    note: string
    date?: string
  }) => Promise<void>
  addExpense: (data: {
    cutterId: string
    amount: number
    category: string
    note: string
    date?: string
  }) => Promise<void>
  deleteIncome: (id: string) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  addShopExpense: (data: {
    amount: number
    note: string
    addedByCutterId: string
    date?: string
  }) => Promise<void>
  deleteShopExpense: (id: string) => Promise<void>
  addStockItem: (data: {
    name: string
    quantity: number
    unit: string
    minStock: number
  }) => Promise<string | null>
  updateStockItem: (
    id: string,
    data: Partial<Pick<StockItem, 'name' | 'quantity' | 'unit' | 'minStock'>>,
  ) => Promise<void>
  deleteStockItem: (id: string) => Promise<void>
  addMonthlyCost: (data: {
    label: string
    amount: number
    month: string
    kind: 'rent' | 'other'
    note: string
  }) => Promise<void>
  deleteMonthlyCost: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

function toErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return 'Something went wrong talking to Supabase'
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cutters, setCutters] = useState<Cutter[]>([])
  const [incomes, setIncomes] = useState<CutterIncome[]>([])
  const [expenses, setExpenses] = useState<CutterExpense[]>([])
  const [shopExpenses, setShopExpenses] = useState<ShopExpense[]>([])
  const [stock, setStock] = useState<StockItem[]>([])
  const [monthlyCosts, setMonthlyCosts] = useState<MonthlyCost[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllData()
      setCutters(data.cutters)
      setIncomes(data.incomes)
      setExpenses(data.expenses)
      setShopExpenses(data.shopExpenses)
      setStock(data.stock)
      setMonthlyCosts(data.monthlyCosts)
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearLegacyLocalData()
    void refresh()
  }, [refresh])

  const addCutter = useCallback(
    async (
      data: Omit<Cutter, 'id' | 'createdAt' | 'active'> & { active?: boolean },
    ) => {
      if (!data.name.trim()) return 'Cutter name is required'
      const next: Cutter = {
        id: uid('cutter'),
        name: data.name.trim(),
        phone: data.phone?.trim() || undefined,
        active: data.active ?? true,
        createdAt: new Date().toISOString(),
      }
      try {
        await insertCutter(next)
        setCutters((prev) => [...prev, next])
        return null
      } catch (err) {
        return toErrorMessage(err)
      }
    },
    [],
  )

  const updateCutter = useCallback(
    async (id: string, data: Partial<Omit<Cutter, 'id' | 'createdAt'>>) => {
      if (data.name !== undefined && !data.name.trim()) {
        return 'Cutter name is required'
      }
      const trimmed = {
        ...data,
        name: data.name?.trim(),
        phone:
          data.phone !== undefined ? data.phone.trim() || undefined : undefined,
      }
      try {
        await patchCutter(id, trimmed)
        setCutters((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...trimmed,
                  name: trimmed.name ?? c.name,
                  phone:
                    data.phone !== undefined ? trimmed.phone : c.phone,
                }
              : c,
          ),
        )
        return null
      } catch (err) {
        return toErrorMessage(err)
      }
    },
    [],
  )

  const deleteCutter = useCallback(async (id: string) => {
    try {
      await deleteCutterRow(id)
      setCutters((prev) => prev.filter((c) => c.id !== id))
      return null
    } catch (err) {
      return toErrorMessage(err)
    }
  }, [])

  const addIncome = useCallback(
    async (data: {
      cutterId: string
      amount: number
      note: string
      date?: string
    }) => {
      const entry: CutterIncome = {
        id: uid('income'),
        cutterId: data.cutterId,
        amount: data.amount,
        note: data.note.trim(),
        date: data.date || todayISO(),
        createdAt: new Date().toISOString(),
      }
      await insertIncome(entry)
      setIncomes((prev) => [entry, ...prev])
    },
    [],
  )

  const addExpense = useCallback(
    async (data: {
      cutterId: string
      amount: number
      category: string
      note: string
      date?: string
    }) => {
      const entry: CutterExpense = {
        id: uid('cexp'),
        cutterId: data.cutterId,
        amount: data.amount,
        category: data.category,
        note: data.note.trim(),
        date: data.date || todayISO(),
        createdAt: new Date().toISOString(),
      }
      await insertExpense(entry)
      setExpenses((prev) => [entry, ...prev])
    },
    [],
  )

  const deleteIncome = useCallback(async (id: string) => {
    await deleteIncomeRow(id)
    setIncomes((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    await deleteExpenseRow(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const addShopExpense = useCallback(
    async (data: {
      amount: number
      note: string
      addedByCutterId: string
      date?: string
    }) => {
      const entry: ShopExpense = {
        id: uid('shop'),
        amount: data.amount,
        note: data.note.trim(),
        addedByCutterId: data.addedByCutterId,
        date: data.date || todayISO(),
        createdAt: new Date().toISOString(),
      }
      await insertShopExpense(entry)
      setShopExpenses((prev) => [entry, ...prev])
    },
    [],
  )

  const deleteShopExpense = useCallback(async (id: string) => {
    await deleteShopExpenseRow(id)
    setShopExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const addStockItem = useCallback(
    async (data: {
      name: string
      quantity: number
      unit: string
      minStock: number
    }) => {
      if (!data.name.trim()) return 'Item name is required'
      const item: StockItem = {
        id: uid('stock'),
        name: data.name.trim(),
        quantity: data.quantity,
        unit: data.unit.trim() || 'pcs',
        minStock: data.minStock,
        updatedAt: new Date().toISOString(),
      }
      try {
        await insertStockItem(item)
        setStock((prev) => [...prev, item])
        return null
      } catch (err) {
        return toErrorMessage(err)
      }
    },
    [],
  )

  const updateStockItem = useCallback(
    async (
      id: string,
      data: Partial<Pick<StockItem, 'name' | 'quantity' | 'unit' | 'minStock'>>,
    ) => {
      const updatedAt = new Date().toISOString()
      const patch = {
        ...data,
        name: data.name?.trim(),
        unit: data.unit?.trim(),
        updatedAt,
      }
      await patchStockItem(id, patch)
      setStock((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...data,
                name: patch.name ?? s.name,
                unit: patch.unit ?? s.unit,
                updatedAt,
              }
            : s,
        ),
      )
    },
    [],
  )

  const deleteStockItem = useCallback(async (id: string) => {
    await deleteStockRow(id)
    setStock((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addMonthlyCost = useCallback(
    async (data: {
      label: string
      amount: number
      month: string
      kind: 'rent' | 'other'
      note: string
    }) => {
      const entry: MonthlyCost = {
        id: uid('month'),
        label: data.label.trim(),
        amount: data.amount,
        month: data.month,
        kind: data.kind,
        note: data.note.trim(),
        createdAt: new Date().toISOString(),
      }
      await insertMonthlyCost(entry)
      setMonthlyCosts((prev) => [entry, ...prev])
    },
    [],
  )

  const deleteMonthlyCost = useCallback(async (id: string) => {
    await deleteMonthlyCostRow(id)
    setMonthlyCosts((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      loading,
      error,
      refresh,
      cutters,
      incomes,
      expenses,
      shopExpenses,
      stock,
      monthlyCosts,
      addCutter,
      updateCutter,
      deleteCutter,
      addIncome,
      addExpense,
      deleteIncome,
      deleteExpense,
      addShopExpense,
      deleteShopExpense,
      addStockItem,
      updateStockItem,
      deleteStockItem,
      addMonthlyCost,
      deleteMonthlyCost,
    }),
    [
      loading,
      error,
      refresh,
      cutters,
      incomes,
      expenses,
      shopExpenses,
      stock,
      monthlyCosts,
      addCutter,
      updateCutter,
      deleteCutter,
      addIncome,
      addExpense,
      deleteIncome,
      deleteExpense,
      addShopExpense,
      deleteShopExpense,
      addStockItem,
      updateStockItem,
      deleteStockItem,
      addMonthlyCost,
      deleteMonthlyCost,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
