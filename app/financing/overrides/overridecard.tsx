import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { JsonViewer } from '@textea/json-viewer'
// import JsonViewEditor from '@uiw/react-json-view/editor';
import { Button } from '@/components/ui/button';
import { FileInput, Code } from 'lucide-react';
import Compare from './compare';

// Add this helper function at the top of the file, outside of the component
const applyValue = (obj: any, path: string[], value: any): any => {
  const [head, ...rest] = path;
  if (rest.length === 0) {
    return { ...obj, [head]: value };
  }
  return {
    ...obj,
    [head]: applyValue(obj[head], rest, value)
  };
};

interface OverrideCardProps {
  // Add any props you need here
  selectedId: string;
  tableName: string;
}

const OverrideCard: React.FC<OverrideCardProps> = ({ selectedId, tableName }) => {
  // const { data: session } = useSession();
  const [overrideData, setOverrideData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [differences, setDifferences] = useState<DiffResult | null>(null);
  // const jsonViewTheme = theme === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    const fetchOverrideData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/overrides?table=${tableName}&id=${selectedId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch override data');
        }
        const data = await response.json();

        setOverrideData(data);
        setOriginalData(data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedId && tableName) {
      fetchOverrideData();
    }
  }, [selectedId, tableName]);

  const handleSave = async () => {
   
    const payload = JSON.stringify({
      newValue: JSON.stringify(overrideData),
      previousValue: JSON.stringify(originalData),
      updatedAt: new Date().toISOString(),
      updatedBy: 'ataliks',
      type: tableName,
      id: selectedId,
      comments:  'No changes to save',
      table: tableName,
    });
    try {
      const response = await fetch('/api/overrides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload
      });

      if (!response.ok) {
        throw new Error('Failed to save override data');
      }

      // Update originalData after successful save
      setOriginalData(overrideData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    }
  };

  const handleReset = () => {
    setOverrideData(originalData);
  };

  const handleDisable = async () => {
    const payload = JSON.stringify({
      newValue: JSON.stringify({ ...overrideData, isActive: false }),
      previousValue: JSON.stringify(originalData),
      updatedAt: new Date().toISOString(),
      updatedBy: 'ataliks',
      type: tableName,
      id: selectedId,
      comments: 'Disabled override',
      table: tableName,
    });

    try {
      const response = await fetch('/api/overrides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload
      });

      if (!response.ok) {
        throw new Error('Failed to disable override');
      }

      // Update both states after successful save
      const updatedData = { ...overrideData, isActive: false };
      setOverrideData(updatedData);
      setOriginalData(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable override');
    }
  };

  const renderFormFields = () => {
    if (!overrideData) return null;

    return Object.entries(overrideData).map(([key, value]) => (
      <div key={key} className="space-y-2">
        <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {key}
        </label>
        <input
          type="text"
          id={key}
          name={key}
          value={String(value)}
          onChange={(e) => {
            // Handle input change here
            setOverrideData((prev: any) => ({ ...prev, [key]: e.target.value }));
          }}
          className="w-full px-3 py-2 border rounded-md text-sm"
        />
      </div>
    ));
  };

  const updateOverrideData = (path: (string | number)[], oldValue: any, newValue: any) => {
    setOverrideData((prevData: any) => applyValue(prevData, path, newValue));
  };

  // Return loading state if data isn't ready
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Return error state if there's an error
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (overrideData && originalData && (
    <div className="w-full h-full max-w-7xl mx-auto flex flex-col">
      {/* Top row with save and reset buttons */}
      <div className="mb-4 flex justify-end space-x-2">
        <Button
          onClick={handleDisable}
          className="outline bg-red-500 hover:bg-red-600"
        >
          Disable
        </Button>
        <Button
          onClick={handleReset} 
          className='outline bg-gray-500'
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          className='outline'
        >
          Save
        </Button>
      </div>

      {/* Existing content */}
      <div className="w-full h-full flex">
        {/* Left column with existing Card component */}
        <div className="w-2/3 pr-4">
          <Card className="w-full h-full">
            <Tabs
              defaultValue="form"
              className="w-full h-full flex flex-col"
              aria-label="Override data views"
            >
              {/* Update the description ID to be more unique */}
              <div id="override-tabs-content-description" className="sr-only">
                Choose between form and code views to manage and edit override data
              </div>
              <TabsList 
                className="grid w-full grid-cols-2"
                aria-describedby="override-tabs-content-description"
              >
                <TabsTrigger 
                  value="form" 
                  className="flex items-center justify-center"
                  aria-label="Switch to form view"
                >
                  <FileInput className="w-4 h-4 mr-2" />
                  Form View
                </TabsTrigger>
                <TabsTrigger 
                  value="code" 
                  className="flex items-center justify-center"
                  aria-label="Switch to code view"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code View
                </TabsTrigger>
              </TabsList>
              <CardContent className="pt-6">
                <TabsContent value="form">
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      renderFormFields()
                    )}
                  </form>
                </TabsContent>
                <TabsContent value="code">
                  <div className="border rounded-md p-4 bg-gray-100 dark:bg-gray-800">
                    {overrideData && (
                      <JsonViewer
                        editable={true}
                        value={overrideData}
                        onChange={updateOverrideData}
                      />
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Right column with dummy content */}
        <div className="w-1/3 pl-1 h-full">
          {overrideData && originalData && (
            <Compare
              obj1={originalData}
              obj2={overrideData}
              // onDifferencesCalculated={(diffs) => {
              //   setDifferences(diffs);

              // }}
            />
          )} 
        </div>
        </div>
      </div>
    
    )
  );
};

export default OverrideCard;
