import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JsonView from '@uiw/react-json-view';
// import JsonViewEditor from '@uiw/react-json-view/editor';

import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';
import { FileInput, Code } from 'lucide-react';

interface OverrideCardProps {
  // Add any props you need here
}

const OverrideCard: React.FC<OverrideCardProps> = () => {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form" className="flex items-center justify-center">
            <FileInput className="w-4 h-4 mr-2" />
            Form View
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center justify-center">
            <Code className="w-4 h-4 mr-2" />
            Code View
          </TabsTrigger>
        </TabsList>
        <CardContent className="pt-6">
          <TabsContent value="form">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
           
            </form>
          </TabsContent>
          <TabsContent value="code">
            <div className="border rounded-md p-4 bg-gray-100 dark:bg-gray-800">
              <JsonView style={githubLightTheme} />
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default OverrideCard;

