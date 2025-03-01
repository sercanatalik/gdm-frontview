"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { JsonNode } from "./json-node"
import type { JsonViewerProps } from "./types"

export function JsonViewer({
  data,
  rootName = "root",
  expanded = true,
  className,
  initialExpandLevel = 1,
  showCopyButton = true,
}: JsonViewerProps) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = React.useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [data])

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <div className="flex items-center justify-between bg-primary/5 px-4 py-2 border-b">
        <h3 className="font-medium text-sm">{rootName}</h3>
        {showCopyButton && (
          <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <CardContent className="p-0 max-h-[500px] overflow-auto">
        <div className="p-4">
          <JsonNode
            data={data}
            name={rootName}
            level={0}
            defaultExpanded={expanded}
            initialExpandLevel={initialExpandLevel}
          />
        </div>
      </CardContent>
    </Card>
  )
}

