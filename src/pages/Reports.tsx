
import { AppLayout } from "@/components/layout/AppLayout";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

const Reports = () => {
  const { auditedItems, getInventorySummary } = useInventory();
  const summary = getInventorySummary();

  const downloadReport = (type: string) => {
    // This is a placeholder for actual report generation
    alert(`Downloading ${type} report...`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and download inventory audit reports</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Inventory Reconciliation Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Complete report of all inventory items with system vs. physical count reconciliation.
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => downloadReport("reconciliation")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Excel
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Discrepancy Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Filtered report showing only items with quantity discrepancies.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => downloadReport("discrepancy")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Excel
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Summary Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                High-level summary of the audit with key metrics and findings.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => downloadReport("summary")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Audit Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{summary.totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items Audited</p>
                <p className="text-2xl font-bold">{summary.auditedItems}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matched Items</p>
                <p className="text-2xl font-bold text-green-600">{summary.matched}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discrepancies</p>
                <p className="text-2xl font-bold text-red-600">{summary.discrepancies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
