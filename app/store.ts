import { Store } from '@tanstack/store'
import type { Filter } from "@/components/ui/filters"
import { FilterTypes, FilterOperators } from "@/components/filters/risk-filter"

interface PnlData {
  desk: string | null
  SL1: string | null
  portfolio: string | null
  YTD: number
  MTD: number
  AOP: number
}

type ViewMode = "desk" | "portfolio" | "SL1"

interface AppState {
  pnlData: PnlData[]
  isLoading: boolean
  viewMode: ViewMode
  expandedGroups: string[]
  selectedDesk: string | null
  filters: Filter[]
}

export const store = new Store<AppState>({
  pnlData: [],
  isLoading: true,
  viewMode: "desk",
  expandedGroups: [],
  selectedDesk: null,
  filters: [],
})

export const fetchPnlData = async () => {
  store.setState(state => ({ ...state, isLoading: true }))
  try {
    const response = await fetch('/api/financing/pnl/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch PnL data')
    }
    const data = await response.json()
    store.setState(state => ({ ...state, pnlData: data, isLoading: false }))
  } catch (error) {
    console.error('Error fetching PnL data:', error)
    store.setState(state => ({ ...state, pnlData: [], isLoading: false }))
  }
}

export const setViewMode = (viewMode: ViewMode) => {
  store.setState(state => ({ ...state, viewMode }))
}

export const toggleExpandGroup = (name: string) => {
  store.setState(state => {
    const expandedGroups = state.expandedGroups.includes(name)
      ? state.expandedGroups.filter(item => item !== name)
      : [...state.expandedGroups, name]
    return { ...state, expandedGroups }
  })
}

export const setSelectedDesk = (desk: string | null) => {
  store.setState(state => {
    const filters = state.filters.filter(f => f.type !== FilterTypes.DESK)
    if (desk) {
      filters.push({
        id: Date.now().toString(),
        type: FilterTypes.DESK,
        operator: FilterOperators.IS,
        value: [desk],
      })
    }
    return { ...state, selectedDesk: desk, filters }
  })
}

export const setFilters = (filters: Filter[]) => {
  store.setState(state => ({ ...state, filters }))
}