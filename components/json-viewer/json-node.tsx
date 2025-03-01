"use client"

import * as React from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JsonNodeProps } from "./types"

export function JsonNode({ data, name, level, defaultExpanded, initialExpandLevel }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded && level < initialExpandLevel)

  const type = data === null ? "null" : data === undefined ? "undefined" : Array.isArray(data) ? "array" : typeof data

  const isExpandable = (type === "object" || type === "array") && data !== null && data !== undefined
  const isEmpty = isExpandable && data && Object.keys(data).length === 0

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "string":
        return "text-green-600 dark:text-green-400"
      case "number":
        return "text-blue-600 dark:text-blue-400"
      case "boolean":
        return "text-purple-600 dark:text-purple-400"
      case "null":
      case "undefined":
        return "text-gray-500 dark:text-gray-400 italic"
      case "object":
      case "array":
        return "text-primary"
      default:
        return "text-primary"
    }
  }

  const toggleExpand = () => {
    if (isExpandable) {
      setIsExpanded(!isExpanded)
    }
  }

  const renderValue = () => {
    if (data === null) return <span className={getTypeStyles("null")}>null</span>
    if (data === undefined) return <span className={getTypeStyles("undefined")}>undefined</span>

    switch (type) {
      case "string":
        return <span className={getTypeStyles("string")}>"{data}"</span>
      case "number":
        return <span className={getTypeStyles("number")}>{data}</span>
      case "boolean":
        return <span className={getTypeStyles("boolean")}>{data.toString()}</span>
      case "object":
      case "array":
        if (isEmpty) {
          return <span className={getTypeStyles(type)}>{type === "object" ? "{}" : "[]"}</span>
        }
        return (
          <span className={getTypeStyles(type)}>
            {type === "object" ? "{" : "["}
            {!isExpanded && "..."}
            {type === "object" ? "}" : "]"}
          </span>
        )
      default:
        return <span>{String(data)}</span>
    }
  }

  const renderChildren = () => {
    if (!isExpandable || !isExpanded || isEmpty) return null

    return (
      <div className="pl-4 border-l border-border/50 mt-1">
        {data &&
          Object.keys(data).map((key) => (
            <JsonNode
              key={key}
              data={data[key]}
              name={key}
              level={level + 1}
              defaultExpanded={defaultExpanded}
              initialExpandLevel={initialExpandLevel}
            />
          ))}
      </div>
    )
  }

  return (
    <div className="my-1">
      <div
        className={cn("flex items-start group", isExpandable && "cursor-pointer hover:bg-muted/50 rounded")}
        onClick={toggleExpand}
      >
        {isExpandable && (
          <div className="mr-1 mt-0.5 text-muted-foreground">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="font-medium text-sm mr-2">
              {Array.isArray(data) ? `${name}[${Object.keys(data).length}]` : name}:
            </span>
            {renderValue()}
          </div>
          {renderChildren()}
        </div>
      </div>
    </div>
  )
}

