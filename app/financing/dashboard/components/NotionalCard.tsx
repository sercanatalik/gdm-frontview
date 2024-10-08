"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote,Loader2 } from "lucide-react";


export function NotionalCard() {
  const [amount, setAmount] = useState(0); // Initial value set to 1000
  const [monthOnMonthChange, setMonthOnMonthChange] = useState(0); // Example value, replace with actual calculation or prop
  const [isLoading, setIsLoading] = useState(true); // Add this line


  useEffect(() => {
    const fetchCashOutAmount = async () => {
      setIsLoading(true); // Add this line
      try {
        const response = await fetch("/api/financing/stats?measure=cashout");
        if (!response.ok) {
          throw new Error("Failed to fetch cash out amount");
        }
        const data = await response.json();
        setAmount(data.amount);
        setMonthOnMonthChange(data.monthOnMonthChange);
        // Optionally, you can also set the percentage change here if it's included in the API response
        // setPercentageChange(data.percentageChange)
      } catch (error) {
        console.error("Error fetching cash out amount:", error);
      } finally {
        setIsLoading(false); // Add this line
      }
    };

    fetchCashOutAmount();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Notional</CardTitle>
        <Banknote />
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
              {amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2, notation: 'compact', compactDisplay: 'short'
              })}
            </div>

            <p className="text-xs text-muted-foreground"> 
              {monthOnMonthChange >= 0 ? '+ ' : '-'} 
              {Math.abs(monthOnMonthChange).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                notation: 'compact',
                compactDisplay: 'short'
              })} from last month
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
