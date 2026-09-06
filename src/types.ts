export interface Cutter {
  id: string
  name: string
  phone?: string
  specialty?: string
  notes?: string
  active: boolean
  createdAt: string
}

export interface CutterIncome {
  id: string
  cutterId: string
  amount: number
  note: string
  date: string
  createdAt: string
}

export interface CutterExpense {
  id: string
  cutterId: string
  amount: number
  category: string
  note: string
  date: string
  createdAt: string
}

export interface ShopExpense {
  id: string
  amount: number
  note: string
  addedByCutterId: string
  date: string
  createdAt: string
}


export interface StockItem {
  id: string
  name: string
  quantity: number
  unit: string
  minStock: number
  updatedAt: string
}

export interface MonthlyCost {
  id: string
  label: string
  amount: number
  month: string
  kind: 'rent' | 'other'
  note: string
  createdAt: string
}

export interface AdminSession {
  username: string
  loggedInAt: string
}
