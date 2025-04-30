
import { AppLayout } from "@/components/layout/AppLayout";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { InventoryTable } from "@/components/inventory/InventoryTable";

const Scanner = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barcode Scanner</h1>
          <p className="text-muted-foreground">Scan items to record physical inventory</p>
        </div>
        
        <BarcodeScanner />

        <div>
          <h2 className="text-lg font-medium mb-4">Current Inventory Status</h2>
          <InventoryTable />
        </div>
      </div>
    </AppLayout>
  );
};

export default Scanner;
