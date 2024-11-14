'use client';
import React, { useState, useEffect } from 'react';
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import OverrideCard from "@/app/financing/overrides/overridecard";
import Compare from '@/app/financing/overrides/compare';
export default function FinancingOverridesPage() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTab, setSelectedTab] = useState('ref_instruments');
  const [selectedId, setSelectedId] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const topTabs = [
    { id: 'ref_instruments', label: 'Instruments' },
    { id: 'trades', label: 'Trades' },
    { id: 'ref_counterparties', label: 'Counterparties' },
  ];

  const refreshData = async () => {
    // Refetch search results if there's a search term
    if (search.trim()) {
      try {
        const response = await axios.post('/api/overrides/search', { searchText: search, table: selectedTab });
        setSearchResults(response.data.data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }

    // Refetch overrides if there's a selected ID
    if (selectedId) {
      try {
        const response = await axios.post('/api/overrides/search', { searchText: selectedId, table: 'overrides' });
        setOverrides(response.data.data);
      } catch (error) {
        console.error('Error fetching overrides:', error);
        setOverrides([]);
      }
    }
  };

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
        setSelectedId(null); // Clear selectedId when search is empty
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, selectedTab]);

  useEffect(() => {
    if (selectedId) {
      refreshData();
    } else {
      setOverrides([]);
    }
  }, [selectedId, selectedTab]);

 

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
                    <Dialog 
                      open={isDialogOpen} 
                      onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                          refreshData();
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button onClick={() => setIsDialogOpen(true)} disabled={!selectedId}>
                          Add New Override
                        </Button>
                      </DialogTrigger>
                      <DialogContent 
                        className="w-full max-w-[90vw] max-h-[90vh] h-full overflow-auto"
                        aria-describedby="dialog-description"
                      >
                        <DialogTitle>Add New Override</DialogTitle>
                        <div id="dialog-description" className="sr-only">
                          Form to add a new override for the selected item
                        </div>
                        <OverrideCard selectedId={selectedId} tableName={selectedTab} />
                      </DialogContent>
                    </Dialog>
                  </div>
                  {overrides.length > 0 ? (
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-2">
                        {overrides.map((override, index) => (
                          <Card 
                            key={index} 
                            className={`p-2 text-sm ${!override.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <CardContent className="p-0">
                              <div> <span className="font-medium">id:</span><span>{override.id}</span></div>
                              <div> <span className="font-medium">type:</span><span>{override.type}</span></div>
                              <div> <span className="font-medium">comments:</span><span>{override.comments}</span></div>
                              {override.isActive === false && (
                                <div><span className="font-medium text-destructive">Status:</span><span> Inactive</span></div>
                              )}
                              <div><Compare hideSummary={true} hideUnchanged={true} obj1={JSON.parse(override.previousValue)} obj2={JSON.parse(override.newValue)} /></div>
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
