import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export interface StatsData {
  current: number
  change: number
  previous: number
  currentDate: string
  previousDate: string
  numDays: number
}

export function StatsCard({
  label,
  icon,
  isLoading,
  data,
}: {
  label: string
  icon: any
  data: StatsData
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />{" "}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              $
              {data.current.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                notation: "compact",
                compactDisplay: "short",
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              {data.change >= 0 ? "+ " : "-"}
              {Math.abs(data.change).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                notation: "compact",
                compactDisplay: "short",
              })}{" "}
              since {data.numDays} days ago
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

