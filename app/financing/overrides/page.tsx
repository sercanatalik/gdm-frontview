'use client';
import React, { useState, useEffect } from 'react';
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import { Button } from "@/components/ui/button";

export default function FinancingOverridesPage() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTab, setSelectedTab] = useState('ref_instruments');
  const [selectedId, setSelectedId] = useState(null);
  const [overrides, setOverrides] = useState([]);

  const topTabs = [
    { id: 'ref_instruments', label: 'Instruments' },
    { id: 'trades', label: 'Trades' },
    { id: 'ref_counterparties', label: 'Counterparties' },
  ];

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (search.trim()) {
        try {
          const response = await axios.post('/api/overrides/search', { searchText: search, table: selectedTab });
          setSearchResults(response.data.data);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, selectedTab]);

  useEffect(() => {
    const fetchOverrides = async () => {
      if (selectedId) {
        try {
          const response = await axios.post('/api/overrides/search', { searchText: selectedId, table: 'overrides' });
    
          setOverrides(response.data.data);
        } catch (error) {
          console.error('Error fetching overrides:', error);
          setOverrides([]);
        }
      } else {
        setOverrides([]);
      }
    };

    fetchOverrides();
  }, [selectedId, selectedTab]);

  const handleAddOverride = () => {
    // TODO: Implement the logic to add a new override
    console.log("Add new override for:", selectedTab, selectedId);
  };

  return (
    <ContentLayout title="Financing Overrides">
      <Tabs defaultValue={topTabs[0].id}>
        <TabsList className="mb-4">
          {topTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} onClick={() => setSelectedTab(tab.id)}> 
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {topTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="h-[calc(100vh-200px)]"> 
                <CardHeader>
                  <CardTitle>{tab.label}</CardTitle>
                </CardHeader>
                <CardContent> 
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-2">
                      {searchResults.map((result, index) => (
                        <Card 
                          key={index} 
                          className={`p-2 text-sm cursor-pointer ${selectedId === result.id ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => setSelectedId(result.id)}
                        >
                          <CardContent className="p-0">
                            {Object.entries(result).slice(0, 5).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-1">
                                <span className="font-medium">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Overrides for {tab.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button onClick={handleAddOverride} disabled={!selectedId}>
                      Add New Override
                    </Button>
                  </div>
                  {overrides.length > 0 ? (
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-2">
                        {overrides.map((override, index) => (
                          <Card key={index} className="p-2 text-sm">
                            <CardContent className="p-0">
                              {Object.entries(override).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-1">
                                  <span className="font-medium">{key}:</span>
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p>No overrides found for the selected {tab.label.toLowerCase()}.</p>
                    
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </ContentLayout>
  );
}
