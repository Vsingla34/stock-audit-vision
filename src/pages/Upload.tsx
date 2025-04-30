
import { AppLayout } from "@/components/layout/AppLayout";
import { FileUploader } from "@/components/upload/FileUploader";

const Upload = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
          <p className="text-muted-foreground">Import your Item Master and Closing Stock data</p>
        </div>
        
        <FileUploader />
      </div>
    </AppLayout>
  );
};

export default Upload;
