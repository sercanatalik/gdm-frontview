export interface MaturingTrade {
  id: string
  instrumentId: string
  instrumentName: string
  instrumentType: string
  counterparty: string
  maturityDate: Date
  notional: number
  cashOut: number
  desk: string
  portfolio: string
  status: "active" | "pending" | "confirmed"
  region: string
  trader: string
}
