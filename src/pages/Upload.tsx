
import { AppLayout } from "@/components/layout/AppLayout";
import { FileUploader } from "@/components/upload/FileUploader";
import { ExampleData } from "@/components/upload/ExampleData";
import { ClearDataButton } from "@/components/upload/ClearDataButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Upload = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
          <p className="text-muted-foreground">Import your Item Master and Closing Stock data</p>
        </div>
        
        <FileUploader />
        
        <ExampleData />
        
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
      </div>
    </AppLayout>
  );
};

export default Upload;
