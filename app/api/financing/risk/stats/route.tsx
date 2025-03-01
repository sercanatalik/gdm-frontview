import { getClickHouseClient, buildWhereCondition } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { filter = null } = await req.json()

    const fields = ["cashOut", "projectedCashOut", "realisedCashOut", "notional"]
    const sumExpressions = fields.map((field) => `SUM(${field})`).join(", ")

    const query = `
            SELECT ${sumExpressions}
            FROM risk_f_mv FINAL
            ${buildWhereCondition(filter)}
        `
    console.log(query)
    const resultSet = await getClickHouseClient().query({
      query,
      format: "JSONEachRow",
    })

    const [result] = await resultSet.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating sums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

