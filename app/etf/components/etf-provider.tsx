'use client'

import React, { createContext, useContext, useState } from 'react'

type Bond = {
  id: string
  name: string
  couponRate: number
  price: number
  weight: number
}

type ETF = {
  id: string
  name: string
  ticker: string
  totalAssets: number
  bonds: Bond[]
}

type ETFContextType = {
  etfs: ETF[]
  updateETF: (etfId: string, updatedETF: Partial<ETF>) => void
  updateBond: (etfId: string, bondId: string, updatedBond: Partial<Bond>) => void
}

const ETFContext = createContext<ETFContextType | undefined>(undefined)

export function ETFProvider({ children }: { children: React.ReactNode }) {
  const [etfs, setETFs] = useState<ETF[]>([
    {
      id: '1',
      name: 'iShares Core U.S. Aggregate Bond ETF',
      ticker: 'AGG',
      totalAssets: 89.33,
      bonds: [
        { id: '1', name: 'US Treasury Bond 1', couponRate: 2.5, price: 98.5, weight: 0.3 },
        { id: '2', name: 'US Treasury Bond 2', couponRate: 3.0, price: 101.2, weight: 0.25 },
        { id: '3', name: 'Corporate Bond 1', couponRate: 4.5, price: 103.7, weight: 0.2 },
        { id: '4', name: 'Corporate Bond 2', couponRate: 3.8, price: 99.8, weight: 0.15 },
        { id: '5', name: 'Municipal Bond 1', couponRate: 3.2, price: 100.5, weight: 0.1 },
      ],
    },
    // Add more ETFs here
  ])

  const updateETF = (etfId: string, updatedETF: Partial<ETF>) => {
    setETFs(prevETFs =>
      prevETFs.map(etf =>
        etf.id === etfId ? { ...etf, ...updatedETF } : etf
      )
    )
  }

  const updateBond = (etfId: string, bondId: string, updatedBond: Partial<Bond>) => {
    setETFs(prevETFs =>
      prevETFs.map(etf =>
        etf.id === etfId
          ? {
              ...etf,
              bonds: etf.bonds.map(bond =>
                bond.id === bondId ? { ...bond, ...updatedBond } : bond
              ),
            }
          : etf
      )
    )
  }

  return (
    <ETFContext.Provider value={{ etfs, updateETF, updateBond }}>
      {children}
    </ETFContext.Provider>
  )
}

export const useETF = () => {
  const context = useContext(ETFContext)
  if (context === undefined) {
    throw new Error('useETF must be used within an ETFProvider')
  }
  return context
}