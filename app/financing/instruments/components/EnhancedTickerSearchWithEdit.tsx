"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Columns } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import EditableSelect from "@/components/ui/editable-select"

interface TickerData {
  id: string
  name: string
  isin: string
  cusip: string
  sedol: string
  issuer: string
  region: string
  country: string
  sector: string
  industry: string
  currency: string
  issue_date: string
  maturity_date: string
  coupon: number
  coupon_frequency: string
  yield_to_maturity: number
  price: number
  face_value: number
  rating: string
  is_callable: boolean
  is_puttable: boolean
  is_convertible: boolean
  updated_at: string
}

interface TickerSearchProps {
  instrumentId?: string;
}

export default function TickerSearch({ instrumentId }: TickerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [tickerData, setTickerData] = useState<TickerData[]>([])
  const [selectedTickerData, setSelectedTickerData] = useState<TickerData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Add new state for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<TickerData>>({});

  const [isinOptions, setIsinOptions] = useState<string[]>([]);

  useEffect(() => {
    if (instrumentId) {
      fetchInstrumentData(instrumentId);
    }
  }, [instrumentId]);

  const fetchInstrumentData = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/instruments?search=${encodeURIComponent(id)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.length > 0) {
        setSelectedTicker(data[0].id);
        setSelectedTickerData(data[0]);
      } else {
        console.error("No results found for the given instrumentId");
      }
    } catch (error) {
      console.error("Failed to fetch instrument data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const fetchData = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/instruments?search=${encodeURIComponent(searchTerm)}`)
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          const data = await response.json()
          setTickerData(data)
        } catch (error) {
          console.error("Failed to fetch data:", error)
        } finally {
          setIsLoading(false)
        }
      }

      const debounceTimer = setTimeout(fetchData, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setTickerData([])
    }
  }, [searchTerm])

  const handleSelectTicker = (ticker: string) => {
    const selected = tickerData.find(t => t.id === ticker)
    if (selected) {
      setSelectedTicker(ticker)
      setSelectedTickerData(selected)
      setSearchTerm("")
    }
  }

  // Add new function to handle edit mode toggle
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      // Reset edited data when exiting edit mode
      setEditedData({});
    }
  };

  // Add new function to handle input changes in edit mode
  const handleEditChange = (key: keyof TickerData, value: string | number | boolean) => {
    setEditedData({ ...editedData, [key]: value });
  };

  // Add new function to save changes
  const saveChanges = async () => {
    if (!selectedTicker) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/instruments?name=${selectedTicker}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update instrument data');
      }

      // Update the selected ticker data with the edited values
      setSelectedTickerData({ ...selectedTickerData, ...editedData } as TickerData);
      setIsEditMode(false);
      setEditedData({});
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this helper function to format currency values
  const formatCurrencyValue = (key: string, value: any, currency: string) => {
    const currencyFields = ['price', 'face_value', 'coupon'];
    if (currencyFields.includes(key)) {
      return `${value} ${currency}`;
    }
    return value;
  };

  // Add new function to fetch ISIN options
  const fetchIsinOptions = async (input: string) => {
    try {
      const response = await fetch(`/api/isin-options?search=${encodeURIComponent(input)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ISIN options');
      }
      const data = await response.json();
      setIsinOptions(data);
    } catch (error) {
      console.error("Failed to fetch ISIN options:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* New top row with search input */}
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Search for a ticker or company name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" /> {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Left Column */}
        <div className="w-2/3">
          {searchTerm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="space-y-2">
                    {tickerData.map((ticker) => (
                      <Card
                        key={ticker.id}
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSelectTicker(ticker.id)}
                      >
                        <CardHeader className="p-3 pb-0">
                          <CardTitle className="text-medium">{ticker.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                          <div className="font-sm">{ticker.id}</div>
                          <div className="text-sm text-gray-500">
                            {ticker.region} | {ticker.issuer}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
           
          {selectedTicker && selectedTickerData && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{selectedTickerData.name} ({selectedTicker}) Reference Data</CardTitle>
                <Button onClick={toggleEditMode}>
                  {isEditMode ? 'Cancel Edit' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {Object.entries(selectedTickerData).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                        <TableCell>
                          {isEditMode ? (
                            key === 'isin' ? (
                              <EditableSelect
                                value={editedData.isin ?? value?.toString()}
                                onChange={(newValue) => handleEditChange('isin', newValue)}
                                onInputChange={fetchIsinOptions}
                                options={isinOptions}
                              />
                            ) : typeof value === 'boolean' ? (
                              <Checkbox
                                checked={editedData[key as keyof TickerData] as boolean ?? value as boolean}
                                onCheckedChange={(checked) => handleEditChange(key as keyof TickerData, checked)}
                              />
                            ) : (
                              <Input
                                type="text"
                                value={editedData[key as keyof TickerData] ?? value?.toString()}
                                onChange={(e) => handleEditChange(key as keyof TickerData, e.target.value)}
                              />
                            )
                          ) : (
                            key === 'is_callable' || key === 'is_puttable' || key === 'is_convertible' ? (
                              <Badge variant={value ? "default" : "secondary"}>
                                {value ? "Yes" : "No"}
                              </Badge>
                            ) : (
                              formatCurrencyValue(key, value?.toString() || 'N/A', selectedTickerData.currency)
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {isEditMode && (
                  <Button onClick={saveChanges} className="mt-4" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This space is reserved for additional information or functionality.</p>
              <Columns className="w-12 h-12 mx-auto mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
