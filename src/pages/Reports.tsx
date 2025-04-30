
import { AppLayout } from "@/components/layout/AppLayout";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

const Reports = () => {
  const { auditedItems, itemMaster, getInventorySummary } = useInventory();
  const summary = getInventorySummary();

  const generateCSV = (data: any[], filename: string) => {
    // Get all possible headers from all objects
    const headers = Array.from(
      new Set(
        data.flatMap(item => Object.keys(item))
      )
    );

    // Create CSV header row
    let csvContent = headers.join(',') + '\n';

    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => {
        // Handle commas and quotes in the data
        const value = item[header] !== undefined ? String(item[header]) : '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(',');
      csvContent += row + '\n';
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${filename} downloaded`);
  };

  const downloadReconciliationReport = () => {
    // Combine item master with audited items
    const reportData = itemMaster.map(item => {
      const auditedItem = auditedItems.find(a => a.id === item.id);
      return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        location: item.location,
        systemQuantity: item.systemQuantity,
        physicalQuantity: auditedItem?.physicalQuantity || 0,
        variance: auditedItem ? auditedItem.physicalQuantity - item.systemQuantity : -item.systemQuantity,
        status: auditedItem?.status || 'pending',
        lastAudited: auditedItem?.lastAudited || ''
      };
    });
    
    generateCSV(reportData, 'inventory_reconciliation_report.csv');
  };

  const downloadDiscrepancyReport = () => {
    // Filter only items with discrepancies
    const discrepancies = itemMaster.map(item => {
      const auditedItem = auditedItems.find(a => a.id === item.id);
      if (!auditedItem) return null;
      
      const variance = auditedItem.physicalQuantity - item.systemQuantity;
      if (variance === 0) return null;
      
      return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        location: item.location,
        systemQuantity: item.systemQuantity,
        physicalQuantity: auditedItem.physicalQuantity,
        variance,
        lastAudited: auditedItem.lastAudited || ''
      };
    }).filter(Boolean);
    
    generateCSV(discrepancies, 'discrepancy_report.csv');
  };

  const downloadSummaryReport = () => {
    // Create summary report
    const summaryData = [
      {
        totalItems: summary.totalItems,
        auditedItems: summary.auditedItems,
        pendingItems: summary.pendingItems,
        matchedItems: summary.matched,
        discrepancies: summary.discrepancies,
        auditCompletionPercentage: summary.totalItems > 0 
          ? Math.round((summary.auditedItems / summary.totalItems) * 100) 
          : 0,
        generatedDate: new Date().toISOString()
      }
    ];
    
    generateCSV(summaryData, 'audit_summary_report.csv');
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
                onClick={downloadReconciliationReport}
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
                onClick={downloadDiscrepancyReport}
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
                onClick={downloadSummaryReport}
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
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
