'use client'

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp } from "lucide-react"

export interface NewsItem {
  id: string
  timestamp: string
  headline: string
  summary: string
  category: string
  content: string
}

export const categoryColors: { [key: string]: string } = {
    Economics: "bg-blue-500",
    Technology: "bg-purple-500",
    Energy: "bg-green-500",
    Healthcare: "bg-red-500",
    Markets: "bg-yellow-500",
    Crypto: "bg-orange-500",
  }

  const newsData: NewsItem[] = [
    {
      id: "1",
      timestamp: "2 minutes ago",
      headline: "Fed Signals Potential Rate Cut in Coming Months",
      summary: "Federal Reserve officials hint at possible interest rate reduction as inflation shows signs of cooling.",
      category: "Economics",
      content: "In a surprising turn of events, Federal Reserve officials have indicated a potential shift in monetary policy, suggesting that interest rate cuts may be on the horizon. This comes as recent economic data shows inflation pressures easing, prompting a reevaluation of the central bank's stance. Market analysts are closely watching these developments, as any change in interest rates could have significant implications for borrowing costs, investment strategies, and overall economic growth. The Fed's next policy meeting is highly anticipated, with many expecting a clearer signal on the timing and extent of possible rate cuts."
    },
    {
      id: "2",
      timestamp: "15 minutes ago",
      headline: "Tech Giant Unveils Revolutionary AI Chip",
      summary: "Leading tech company announces new AI processor, claiming 10x performance improvement over competitors.",
      category: "Technology",
      content: "A major player in the tech industry has just announced a groundbreaking AI chip that promises to revolutionize artificial intelligence processing. The new chip, developed after years of research and billions in investment, is said to offer performance gains of up to 10 times over current leading processors. This leap in AI capabilities could have far-reaching implications across various sectors, from autonomous vehicles to advanced medical diagnostics. Industry experts are hailing this as a potential game-changer that could accelerate the adoption of AI technologies in everyday applications. The company plans to begin mass production of the chip within the next quarter, with several major tech firms already lined up as early adopters."
    },
    {
      id: "3",
      timestamp: "32 minutes ago",
      headline: "Global Oil Prices Surge Amid Middle East Tensions",
      summary: "Crude oil futures jump 5% as geopolitical conflicts threaten supply chains.",
      category: "Energy",
      content: "Global oil markets are experiencing significant volatility as geopolitical tensions in the Middle East threaten to disrupt major supply chains. Crude oil futures have surged by 5% in response to the latest developments, with Brent crude reaching its highest level in 18 months. The situation has raised concerns about potential supply shortages and their impact on global economic recovery. Energy analysts are closely monitoring the situation, with some predicting that prices could climb even higher if the conflict escalates. This surge in oil prices is expected to have ripple effects across various industries, potentially leading to increased transportation costs and inflationary pressures in many economies."
    },
    {
      id: "4",
      timestamp: "1 hour ago",
      headline: "Major Merger in Pharmaceutical Industry Announced",
      summary: "Two of the world's largest drug makers agree to $100 billion merger, reshaping the healthcare landscape.",
      category: "Healthcare",
      content: "In a move that's set to reshape the global pharmaceutical landscape, two industry giants have announced a $100 billion merger. This deal, one of the largest in healthcare history, is expected to create a powerhouse in drug development and distribution. The merged entity will have a combined portfolio spanning a wide range of therapeutic areas, from oncology to rare diseases. Analysts predict that this consolidation could lead to increased R&D capabilities and potentially faster drug development timelines. However, the merger is likely to face intense scrutiny from regulatory bodies concerned about market concentration and its impact on drug pricing. The companies have stated that they expect the deal to close within 12 months, pending shareholder and regulatory approvals."
    },
    {
      id: "5",
      timestamp: "1 hour ago",
      headline: "Stock Market Reaches New All-Time High",
      summary: "S&P 500 closes at record levels, driven by strong earnings reports and positive economic data.",
      category: "Markets",
      content: "The S&P 500 index has closed at a new all-time high, marking a significant milestone in the current bull market run. This surge has been fueled by a combination of strong corporate earnings reports and encouraging economic data. Technology and financial sectors led the gains, with several major companies beating analyst expectations. The positive momentum in the stock market reflects growing investor confidence in the economic recovery and future growth prospects. However, some market watchers caution about potential overvaluation and the need for continued strong fundamentals to support these elevated levels. The record-breaking close has also reignited discussions about wealth inequality and the disconnect between Wall Street performance and Main Street economic realities."
    },
    {
      id: "6",
      timestamp: "2 hours ago",
      headline: "EU Proposes Stricter Regulations on Cryptocurrency",
      summary: "European Union unveils new framework for crypto assets, aiming to protect investors and maintain financial stability.",
      category: "Crypto",
      content: "The European Union has proposed a comprehensive new regulatory framework for cryptocurrency assets, in a move that could significantly impact the rapidly evolving crypto market. The proposed regulations aim to provide greater protection for investors while also addressing concerns about financial stability and potential illicit activities. Key aspects of the framework include stricter licensing requirements for crypto exchanges, enhanced transparency measures, and new rules for stablecoin issuers. The proposal has received mixed reactions from the crypto industry, with some praising the move towards regulatory clarity while others express concerns about potential innovation stifling. If approved, these regulations could set a precedent for crypto governance globally and potentially influence similar measures in other jurisdictions."
    },
  ]
export default function NewsTable() {
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  const toggleRow = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Headline</TableHead>
            <TableHead className="hidden md:table-cell">Summary</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {newsData.map((item) => (
            <>
              <TableRow 
                key={item.id} 
                className="cursor-pointer"
                onClick={() => toggleRow(item.id)}
              >
                <TableCell className="font-semibold">{item.headline}</TableCell>
                <TableCell className="hidden md:table-cell">{item.summary}</TableCell>
                <TableCell>
                  {expandedRows.includes(item.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </TableCell>
              </TableRow>
              {expandedRows.includes(item.id) && (
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted">
                    <div className="p-4">
                      <h3 className="font-bold mb-2">{item.headline}</h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">{item.timestamp}</span>
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${categoryColors[item.category]}`}>
                          {item.category}
                        </span>
                      </div>
                      <p>{item.content}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}