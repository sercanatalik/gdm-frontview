import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"

interface DatasourceSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function DatasourceSelector({ value, onValueChange }: DatasourceSelectorProps) {
  const [tables, setTables] = useState<string[]>([])
  const [columngGroups, setColumngGroups] = useState<string[]>([])
  const [columnsValues, setColumnsValues] = useState<string[]>([])

  
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('/api/tables?table=db')
        const data = await response.json()
        const tableNames = data.map((table: any) => table.name)
        setTables(tableNames)
      } catch (error) {
        console.error('Error fetching tables:', error)
      }
    }

    fetchTables()
  }, [])

  const handleValueChange = async (selectedTable: string) => {
    try {
      const response = await fetch(`/api/tables?table=${selectedTable}`)
      const columns = await response.json()
      // Handle the columns data as needed
      console.log('Table columns:', columns)

    } catch (error) {
      console.error('Error fetching columns:', error)
    }
    onValueChange(selectedTable)
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[120px] text-sm">
        <SelectValue placeholder="Datasource" />
      </SelectTrigger>
      <SelectContent>
        {tables.map((table) => (
          <SelectItem key={table} value={table}>
            {table}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 

