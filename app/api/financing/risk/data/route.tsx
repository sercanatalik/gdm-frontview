import { buildWhereCondition } from "@/lib/clickhouse-wrap"
import { handleApiResponse } from "@/lib/api-utils"

interface RiskDataResponse {
  // Define the structure of your risk data here
  // Example fields - adjust according to your actual data structure
  id: string;
  asOfDate: string;
  cashOut: number;
  // Add other fields as needed
}

export async function POST(req: Request) {
  const { filter = null, orderBy = null } = await req.json()

  const query = `
    SELECT *
    FROM risk_f_mv  
    ${buildWhereCondition(filter, false, orderBy)}
  `

  return handleApiResponse<RiskDataResponse>(query, {
    useCache: true,
    ttl: 300 // Cache for 5 minutes
  })
}
