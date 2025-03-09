import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Database } from "lucide-react"

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

    } catch (error) {
      console.error('Error fetching columns:', error)
    }
    onValueChange(selectedTable)
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[160px] text-sm bg-gray-050 flex items-center gap-2 border-0">
        <Database className="h-4 w-4" />
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

