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
import { DollarSign,Landmark,Banknote,History } from 'lucide-react';



interface Desk {
  hmsbook_desk: string;
}

interface StatsQuery {
  notionalCcy: {
    current: number;
    previous: number;
    change: number;
  };
  accrualDaily: {
    current: number;
    previous: number;
    change: number;
  };
  accrualProjected: {
    current: number;
    previous: number;
    change: number;
  };
  accrualRealised: {
    current: number;
    previous: number;
    change: number;
  };
}

const Stats: React.FC = () => {
  const [isLoading, setIsLoading] = useState({
    desks: true,
    stats: true
  });
  const [selectedDesk, setSelectedDesk] = useState<string>('');
  const [desks, setDesks] = useState<Desk[]>([]);
  const [stats, setStats] = useState<StatsQuery | null>(null);

  const fetchDesks = async () => {
    try {
      const response = await fetch('/api/financing/stats?measure=desk');
      if (!response.ok) throw new Error('Failed to fetch desks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching desks:', error);
      return [];
    }
  };

  const fetchStats = async (desk: string) => {
    try {
      const response = await fetch(`/api/financing/stats?measure=stats&filter={"desk":"${desk}"}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeDesks = async () => {
      setIsLoading(prev => ({ ...prev, desks: true }));
      const data = await fetchDesks();
      setDesks(data);
      if (data.length > 0) {
        setSelectedDesk(data[0].hmsbook_desk);
      }
      setIsLoading(prev => ({ ...prev, desks: false }));
    };

    initializeDesks();
  }, []);

  useEffect(() => {
    if (!selectedDesk) return;

    const loadStats = async () => {
      setIsLoading(prev => ({ ...prev, stats: true }));
      const data = await fetchStats(selectedDesk);
      console.log(data)
      setStats(data);
      setIsLoading(prev => ({ ...prev, stats: false }));
    };

    loadStats();
  }, [selectedDesk]);

  const statsCards = [
    { 
      label: "Total Cashout", 
      icon: <DollarSign />, 
      data: stats?.notionalCcy ? {
        current: stats.notionalCcy.current,
        previous: stats.notionalCcy.previous,
        change: stats.notionalCcy.change
      } : { current: 0, previous: 0, change: 0 }
    },
    { 
      label: "Daily Accrual", 
      icon: <Landmark />, 
      data: stats?.accrualDaily ? {
        current: stats.accrualDaily.current,
        previous: stats.accrualDaily.previous,
        change: stats.accrualDaily.change
      } : { current: 0, previous: 0, change: 0 }
    },
    { 
      label: "Projected Accrual", 
      icon: <Banknote />, 
      data: stats?.accrualProjected ? {
        current: stats.accrualProjected.current,
        previous: stats.accrualProjected.previous,
        change: stats.accrualProjected.change
      } : { current: 0, previous: 0, change: 0 }
    },
    { 
      label: "Past Accrual", 
      icon: <History />, 
      data: stats?.accrualRealised ? {
        current: stats.accrualRealised.current,
        previous: stats.accrualRealised.previous,
        change: stats.accrualRealised.change
      } : { current: 0, previous: 0, change: 0 }
    }
  ];

  return (
    <div className="hidden flex-col md:flex">

      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Financing Frontview</h2>
          <div className="flex items-center space-x-2">

          </div>
        </div>
        {!isLoading.desks ? (
          <Tabs
            defaultValue={selectedDesk}
            className="space-y-4"
            onValueChange={setSelectedDesk}
          >
            <div className="flex justify-between items-center">
              <TabsList>
                {desks.map((desk) => (
                  <TabsTrigger key={desk.hmsbook_desk} value={desk.hmsbook_desk}>
                    {desk.hmsbook_desk}
                  </TabsTrigger>
                ))}
              </TabsList>

            </div>
            <TabsContent value={selectedDesk} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((card, index) => (
                  <StatsCard
                    key={index}
                    label={card.label}
                    icon={card.icon}
                    data={card.data}
                    isLoading={isLoading.stats}
                  />
                ))}
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
