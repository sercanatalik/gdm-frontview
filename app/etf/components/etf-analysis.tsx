'use client'

import { useState } from 'react'
import { useETF } from './etf-provider'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table,  TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type Bond = {
  id: string
  name: string
  couponRate: number
  price: number
  weight: number
  lastPx: number
  ytm: number
  zSpread: number
  pxChange: number
  yieldChange: number
  spreadChange: number
  risk: number
}

type ETF = {
  id: string
  name: string
  ticker: string
  totalAssets: number
  bonds: Bond[]
}

type ETFAnalysisProps = {
  etf: ETF
}

export function ETFAnalysis({ etf }: ETFAnalysisProps) {
  const { updateETF, updateBond } = useETF()
  const [editingBond, setEditingBond] = useState<string | null>(null)

  const calculateWeightedPrice = () => {
    return etf.bonds.reduce((acc, bond) => acc + (bond.price ?? 0) * (bond.weight ?? 0), 0).toFixed(2)
  }

  const handleETFUpdate = (field: string, value: string) => {
    updateETF(etf.id, { [field]: field === 'totalAssets' ? parseFloat(value) : value })
  }

  const handleBondChange = (bondId: string, field: string, value: string) => {
    updateBond(etf.id, bondId, { [field]: parseFloat(value) })
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm"><strong>{etf.name}</strong> ({etf.ticker})</p>
          <p className="text-xs text-muted-foreground">Total Assets: ${etf.totalAssets?.toFixed(2) ?? '0.00'} Billion</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">Edit ETF Details</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit ETF Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="etfName" className="text-right">Name</Label>
                <Input
                  id="etfName"
                  value={etf.name}
                  onChange={(e) => handleETFUpdate('name', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="etfTicker" className="text-right">Ticker</Label>
                <Input
                  id="etfTicker"
                  value={etf.ticker}
                  onChange={(e) => handleETFUpdate('ticker', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="etfAssets" className="text-right">Total Assets</Label>
                <Input
                  id="etfAssets"
                  value={etf.totalAssets}
                  onChange={(e) => handleETFUpdate('totalAssets', e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table className="w-full text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="p-2">Bond</TableHead>
            <TableHead className="p-2">Coupon</TableHead>
            <TableHead className="p-2">Price</TableHead>
            <TableHead className="p-2">Weight</TableHead>
            <TableHead className="p-2">Last Px</TableHead>
            <TableHead className="p-2">YTM</TableHead>
            <TableHead className="p-2">Z-Spread</TableHead>
            <TableHead className="p-2">Px Chg</TableHead>
            <TableHead className="p-2">Yld Chg</TableHead>
            <TableHead className="p-2">Sprd Chg</TableHead>
            <TableHead className="p-2">Risk</TableHead>
            <TableHead className="p-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {etf.bonds.map(bond => (
            <TableRow key={bond.id}>
              <TableCell className="p-2">{bond.name}</TableCell>
              <TableCell className="p-2">{bond.couponRate?.toFixed(2) ?? '0.00'}%</TableCell>
              <TableCell className="p-2">${bond.price?.toFixed(2) ?? '0.00'}</TableCell>
              <TableCell className="p-2">{((bond.weight ?? 0) * 100).toFixed(2)}%</TableCell>
              <TableCell className="p-2">${bond.lastPx?.toFixed(2) ?? '0.00'}</TableCell>
              <TableCell className="p-2">{bond.ytm?.toFixed(2) ?? '0.00'}%</TableCell>
              <TableCell className="p-2">{bond.zSpread?.toFixed(2) ?? '0.00'}</TableCell>
              <TableCell className="p-2">{bond.pxChange?.toFixed(2) ?? '0.00'}%</TableCell>
              <TableCell className="p-2">{bond.yieldChange?.toFixed(2) ?? '0.00'}%</TableCell>
              <TableCell className="p-2">{bond.spreadChange?.toFixed(2) ?? '0.00'}</TableCell>
              <TableCell className="p-2">{bond.risk?.toFixed(2) ?? '0.00'}</TableCell>
              <TableCell className="p-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setEditingBond(bond.id)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Bond Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                          id="name"
                          value={bond.name}
                          onChange={(e) => handleBondChange(bond.id, 'name', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="couponRate" className="text-right">Coupon Rate</Label>
                        <Input
                          id="couponRate"
                          value={bond.couponRate}
                          onChange={(e) => handleBondChange(bond.id, 'couponRate', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Price</Label>
                        <Input
                          id="price"
                          value={bond.price}
                          onChange={(e) => handleBondChange(bond.id, 'price', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="weight" className="text-right">Weight</Label>
                        <Input
                          id="weight"
                          value={bond.weight}
                          onChange={(e) => handleBondChange(bond.id, 'weight', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lastPx" className="text-right">Last Px</Label>
                        <Input
                          id="lastPx"
                          value={bond.lastPx}
                          onChange={(e) => handleBondChange(bond.id, 'lastPx', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ytm" className="text-right">YTM</Label>
                        <Input
                          id="ytm"
                          value={bond.ytm}
                          onChange={(e) => handleBondChange(bond.id, 'ytm', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="zSpread" className="text-right">Z-Spread</Label>
                        <Input
                          id="zSpread"
                          value={bond.zSpread}
                          onChange={(e) => handleBondChange(bond.id, 'zSpread', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pxChange" className="text-right">Px Change</Label>
                        <Input
                          id="pxChange"
                          value={bond.pxChange}
                          onChange={(e) => handleBondChange(bond.id, 'pxChange', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="yieldChange" className="text-right">Yield Change</Label>
                        <Input
                          id="yieldChange"
                          value={bond.yieldChange}
                          onChange={(e) => handleBondChange(bond.id, 'yieldChange', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="spreadChange" className="text-right">Spread Change</Label>
                        <Input
                          id="spreadChange"
                          value={bond.spreadChange}
                          onChange={(e) => handleBondChange(bond.id, 'spreadChange', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="risk" className="text-right">Risk</Label>
                        <Input
                          id="risk"
                          value={bond.risk}
                          onChange={(e) => handleBondChange(bond.id, 'risk', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <p className="font-semibold">Weighted Price: ${calculateWeightedPrice()}</p>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Weight Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={etf.bonds}
              dataKey="weight"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {etf.bonds.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
