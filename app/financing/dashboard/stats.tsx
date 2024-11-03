'use client'
import { Tabs } from '@/components/ui/tabs';
import React from 'react';
import { useState, useEffect } from 'react';

import { TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Overview } from "@/app/financing/dashboard/components/Overview"
import { RecentTradesCard } from "@/app/financing/dashboard/components/RecentTradeCard"
import NewsTable from "@/app/financing/dashboard/components/NewsTable"
import FinancingBreakdownChart from "@/app/financing/dashboard/components/FinancingBreakdownChart"

import { StatsCard ,StatsData}   from "@/app/financing/dashboard/components/StatsCard"
import { DollarSign,Landmark,Banknote } from 'lucide-react';



interface Desk {
  hmsDesk: string;
}

interface StatsProps {
  // Add any props you need here
}

interface StatsQuery {
  key: StatsData;
 
}

const Stats: React.FC<StatsProps> = () => {
  const [selectedDesk, setSelectedDesk] = useState<string>('Commodities');
  const [desks, setDesks] = useState<Desk[]>([]);
  const [isLoadingDesks, setIsLoadingDesks] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [stats, setStats] = useState<StatsQuery | null>(null);

  useEffect(() => {
    const fetchDesks = async () => {
      setIsLoadingDesks(true);
      try {
        const response = await fetch('/api/financing/stats?measure=desk');
        if (!response.ok) {
          throw new Error('Failed to fetch desks');
        }
        const data: Desk[] = await response.json();

        setDesks(data);
        // Set the default selected desk to the first one in the list
        if (data.length > 0) {
          setSelectedDesk(data[0].hmsDesk);
        }
        setIsLoadingDesks(false);
      } catch (error) {
        console.error('Error fetching desks:', error);
      }
    };

    fetchDesks();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const response = await fetch(`/api/financing/stats?measure=stats&filter={"desk":"${selectedDesk}"}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data: StatsQuery = await response.json();
        setStats(data);
        
      } catch (error) {
        console.error('Error fetching desks:', error);
      }
      setIsLoadingStats(false);
    };
    fetchStats();
  }, [selectedDesk]);

  return (
    <div className="hidden flex-col md:flex">

      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Financing Frontview</h2>
          <div className="flex items-center space-x-2">

          </div>
        </div>
        {!isLoadingDesks ? (
          <Tabs
            defaultValue={selectedDesk}
            className="space-y-4"
            onValueChange={(value) => setSelectedDesk(value)}
          >
            <div className="flex justify-between items-center">
              <TabsList>
                {desks.map((desk) => (
                  <TabsTrigger key={desk.hmsDesk} value={desk.hmsDesk}>
                    {desk.hmsDesk}
                  </TabsTrigger>
                ))}
              </TabsList>

            </div>
            <TabsContent value={selectedDesk} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard  label="Total Cashout" icon={<DollarSign />} data={stats?.notionalCcy ?? '-'} isLoading={isLoadingStats} />  
                <StatsCard  label="Daily Accrual" icon={<Landmark />} data={stats?.accrualDaily ?? '-'} isLoading={isLoadingStats} />  
                <StatsCard  label="Projected Accrual" icon={<Banknote />} data={stats?.accrualProjected ?? '-'} isLoading={isLoadingStats} />  
                

              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <Tabs defaultValue="historical">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle>

                        <TabsList>
                          <TabsTrigger value="historical">Historical Cashout</TabsTrigger>
                          <TabsTrigger value="future">Future Cashout</TabsTrigger>
                        </TabsList>


                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <TabsContent value="historical">
                        <Overview />
                      </TabsContent>
                      <TabsContent value="future">
                        {/* Add future cashout overview content here */}
                        <p>Future cashout overview content goes here</p>
                      </TabsContent>
                    </CardContent>
                  </Tabs>
                </Card>
                <RecentTradesCard />
              </div>
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">

                <Card className="col-span-5">
                  <CardHeader>
                    <CardTitle>Exposure Highlights</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-5">

                    <NewsTable />    </CardContent>
                </Card>

                <FinancingBreakdownChart desk={selectedDesk} />

              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             

              </div>

            </TabsContent>
          </Tabs>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default Stats;
