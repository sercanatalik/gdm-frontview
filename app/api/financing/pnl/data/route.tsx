import { handleApiResponse } from "@/lib/api-utils"

interface PnLDataResponse {
  // Define the structure of your PnL data here
  // Example fields - adjust according to your actual data structure
  asOfDate: string;
  pnl: number;
  // Add other fields as needed
}

export async function POST() {
  const query = `
    SELECT *
    FROM pnl_eod  
    ORDER BY asOfDate DESC
  `

  return handleApiResponse<PnLDataResponse>(query, {
    useCache: true,
    ttl: 300 // Cache for 5 minutes
  })
}
