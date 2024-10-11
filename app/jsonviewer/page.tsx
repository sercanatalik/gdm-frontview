"use client"

import { useState, useCallback } from "react"
import { ChevronRight, ChevronDown, Copy, Check, Edit, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue }

interface JSONViewerProps {
  data: JSONValue
  level?: number
  onUpdate: (newData: JSONValue) => void
  isEditable: boolean
}

function JSONViewer({ data, level = 0, onUpdate, isEditable }: JSONViewerProps) {
  const [expanded, setExpanded] = useState(level < 2)
  const [localData, setLocalData] = useState(data)

  const toggleExpand = () => setExpanded(!expanded)

  const handleUpdate = useCallback((key: string, value: JSONValue) => {
    const newData = { ...localData, [key]: value }
    setLocalData(newData)
    onUpdate(newData)
  }, [localData, onUpdate])

  if (typeof localData !== "object" || localData === null) {
    return isEditable ? (
      <Input
        value={String(localData)}
        onChange={(e) => onUpdate(e.target.value)}
        className="w-full max-w-xs inline-block"
      />
    ) : (
      <span className="text-green-600">{JSON.stringify(localData)}</span>
    )
  }

  const isArray = Array.isArray(localData)

  return (
    <div className="ml-4">
      <span
        onClick={toggleExpand}
        className="cursor-pointer inline-flex items-center"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
        <span className="text-blue-600 ml-1">
          {isArray ? "[" : "{"}
        </span>
      </span>
      {expanded && (
        <div className="ml-4">
          {Object.entries(localData).map(([key, value]) => (
            <div key={key} className="my-1">
              {isEditable && !isArray ? (
                <Input
                  value={key}
                  onChange={(e) => {
                    const newData = { ...localData }
                    delete newData[key]
                    newData[e.target.value] = value
                    setLocalData(newData)
                    onUpdate(newData)
                  }}
                  className="w-24 mr-2 inline-block"
                />
              ) : (
                <span className="text-red-600">
                  {isArray ? key : `"${key}"`}
                </span>
              )}
              : <JSONViewer data={value} level={level + 1} onUpdate={(newValue) => handleUpdate(key, newValue)} isEditable={isEditable} />
            </div>
          ))}
          {isEditable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newKey = isArray ? localData.length : "newKey"
                const newData = isArray ? [...localData, null] : { ...localData, [newKey]: null }
                setLocalData(newData)
                onUpdate(newData)
              }}
              className="mt-2"
            >
              Add {isArray ? "Item" : "Property"}
            </Button>
          )}
        </div>
      )}
      <span className="text-blue-600">
        {isArray ? "]" : "}"}
      </span>
    </div>
  )
}

export default function Component() {
  const [copied, setCopied] = useState(false)
  const [isEditable, setIsEditable] = useState(false)
  const [jsonData, setJsonData] = useState({
    name: "John Doe",
    age: 30,
    isStudent: false,
    hobbies: ["reading", "swimming", "coding"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      country: "USA"
    },
    grades: [
      { subject: "Math", score: 90 },
      { subject: "English", score: 85 },
      { subject: "Science", score: 92 }
    ]
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleUpdate = (newData: JSONValue) => {
    setJsonData(newData as typeof jsonData)
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow relative">
      <h1 className="text-2xl font-bold mb-4">JSON Viewer and Editor</h1>
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-mode"
            checked={isEditable}
            onCheckedChange={setIsEditable}
          />
          <Label htmlFor="edit-mode">Edit Mode</Label>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="font-mono text-sm mt-16">
        <JSONViewer data={jsonData} level={0} onUpdate={handleUpdate} isEditable={isEditable} />
      </div>
    </div>
  )
}