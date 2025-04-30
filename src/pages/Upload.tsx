
import { AppLayout } from "@/components/layout/AppLayout";
import { FileUploader } from "@/components/upload/FileUploader";
import { ExampleData } from "@/components/upload/ExampleData";
import { ClearDataButton } from "@/components/upload/ClearDataButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Upload = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
          <p className="text-muted-foreground">Import your Item Master and Closing Stock data</p>
        </div>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="examples">Example Templates</TabsTrigger>
            <TabsTrigger value="clear">Clear Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Inventory Data</CardTitle>
                <CardDescription>
                  Upload your Item Master (without quantity) and Closing Stock (with quantity) files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader />
              </CardContent>
            </Card>
            
            <Card className="p-6 border-blue-200 bg-blue-50">
              <h3 className="text-md font-semibold text-blue-800 mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Item Master should contain product information WITHOUT quantities</li>
                <li>Closing Stock should contain the quantities for each location</li>
                <li>The same item can appear in multiple locations with different quantities</li>
                <li>Ensure both files use the same item IDs and SKUs for proper matching</li>
              </ul>
            </Card>
          </TabsContent>
          
          <TabsContent value="examples">
            <ExampleData />
          </TabsContent>
          
          <TabsContent value="clear">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Clear All Data</CardTitle>
                <CardDescription>
                  This will reset all your inventory data. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClearDataButton />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Upload;
