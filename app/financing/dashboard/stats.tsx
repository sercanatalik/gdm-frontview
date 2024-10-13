'use client'
import { Tabs } from '@/components/ui/tabs';
import React from 'react';
import { useState } from 'react';

import { TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"   
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CashOutCard } from "@/app/financing/dashboard/components/CashOutCard"                     
import { NotionalCard } from "@/app/financing/dashboard/components/NotionalCard"                     
import { DailyAccrualCard } from "@/app/financing/dashboard/components/DailyAccrualCard"                     
import { Overview } from "@/app/financing/dashboard/components/Overview"                         
import { RecentTradesCard } from "@/app/financing/dashboard/components/RecentTradeCard"                     
import NewsTable from "@/app/financing/dashboard/components/NewsTable"                     
import { BreakdownByDesk  } from "@/app/financing/dashboard/components/BreakdownByDesk"


interface StatsProps {
  // Add any props you need here
}

const Stats: React.FC<StatsProps> = () => {
  const [selectedDesk, setSelectedDesk] = useState<string>('sip');

  return (
    <div className="hidden flex-col md:flex">

        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Financing Frontview</h2>
            <div className="flex items-center space-x-2">

            </div>
          </div>
          <Tabs 
            defaultValue="sip" 
            className="space-y-4"
            onValueChange={(value) => setSelectedDesk(value)}
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="Commodities">Structured Index Products</TabsTrigger>
                <TabsTrigger value="Securities Financing">Securities Financing</TabsTrigger>
              </TabsList>
              <Tabs >
                <TabsList>
                  <TabsTrigger value="fx" disabled>Structured Credit </TabsTrigger>
                  <TabsTrigger value="em" disabled> Flow Credit</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <TabsContent value={selectedDesk} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <CashOutCard filter={{desk:selectedDesk}}/>
                <NotionalCard filter={{desk:selectedDesk}}/>
                <DailyAccrualCard />

                <CashOutCard filter={{desk:selectedDesk}}/>

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
                    <CardTitle>Headlines on Exposure</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-5">

                    <NewsTable />    </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Breakdown by Desk</CardTitle>
                  </CardHeader>
                  <CardContent>
              
                      <BreakdownByDesk />  
                  
                   </CardContent>
                </Card>

              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <CashOutCard filter={{desk:selectedDesk}} />
                <NotionalCard     />
                <DailyAccrualCard />

                <CashOutCard filter={{desk:selectedDesk}} />

              </div>

            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
};

export default Stats;
