
import { AppLayout } from "@/components/layout/AppLayout";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FilePdf, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useRef } from "react";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const Reports = () => {
  const { auditedItems, itemMaster, getInventorySummary } = useInventory();
  const summary = getInventorySummary();
  const reportRef = useRef(null);

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

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Inventory Audit Report", 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add summary section
    doc.setFontSize(14);
    doc.text("Audit Summary", 14, 40);
    
    // Summary table
    const summaryTableBody = [
      ["Total Items", summary.totalItems.toString()],
      ["Audited Items", summary.auditedItems.toString()],
      ["Matched Items", summary.matched.toString()],
      ["Discrepancies", summary.discrepancies.toString()],
      ["Completion Rate", `${summary.totalItems > 0 
        ? Math.round((summary.auditedItems / summary.totalItems) * 100) 
        : 0}%`]
    ];
    
    doc.autoTable({
      startY: 45,
      head: [["Metric", "Value"]],
      body: summaryTableBody,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] } // Using purple theme color
    });
    
    // Add observations section
    const currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Observations", 14, currentY);
    
    // Generate observations
    const observations = [];
    
    if (summary.discrepancies > 0) {
      observations.push(`There are ${summary.discrepancies} items with quantity discrepancies.`);
    } else {
      observations.push("All audited items match their expected quantities.");
    }
    
    if (summary.pendingItems > 0) {
      observations.push(`${summary.pendingItems} items (${Math.round((summary.pendingItems / summary.totalItems) * 100)}%) are still pending audit.`);
    } else {
      observations.push("All items have been audited.");
    }
    
    // Add location-specific observations if we have any audited items
    if (auditedItems.length > 0) {
      // Get unique locations
      const locations = [...new Set(itemMaster.map(item => item.location))];
      
      // Calculate discrepancies by location
      const locationStats = locations.map(loc => {
        const locItems = itemMaster.filter(item => item.location === loc);
        const locAudited = locItems.filter(item => 
          auditedItems.some(a => a.id === item.id)
        );
        const locDiscrepancies = locItems.filter(item => {
          const auditedItem = auditedItems.find(a => a.id === item.id);
          return auditedItem && auditedItem.status === "discrepancy";
        });
        
        return {
          location: loc,
          total: locItems.length,
          audited: locAudited.length,
          discrepancies: locDiscrepancies.length
        };
      });
      
      // Add location observations
      locationStats.forEach(stat => {
        if (stat.audited > 0) {
          observations.push(
            `Location ${stat.location}: ${stat.audited}/${stat.total} items audited, ${stat.discrepancies} discrepancies found.`
          );
        }
      });
    }
    
    // Add the observations to the PDF
    let observationY = currentY + 10;
    observations.forEach(obs => {
      doc.setFontSize(11);
      doc.text(`• ${obs}`, 16, observationY);
      observationY += 7;
    });
    
    // Add discrepancy table if there are any
    const discrepancies = itemMaster
      .map(item => {
        const auditedItem = auditedItems.find(a => a.id === item.id);
        if (!auditedItem || auditedItem.status !== "discrepancy") return null;
        
        const variance = auditedItem.physicalQuantity - item.systemQuantity;
        return [
          item.sku,
          item.name,
          item.location,
          item.systemQuantity.toString(),
          auditedItem.physicalQuantity.toString(),
          variance.toString()
        ];
      })
      .filter(Boolean);
      
    if (discrepancies.length > 0) {
      const discrepancyY = observationY + 10;
      doc.setFontSize(14);
      doc.text("Discrepancy Details", 14, discrepancyY);
      
      doc.autoTable({
        startY: discrepancyY + 5,
        head: [["SKU", "Name", "Location", "System Qty", "Physical Qty", "Variance"]],
        body: discrepancies,
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] }, // Orange for warnings
        styles: { fontSize: 9 }
      });
    }
    
    doc.save("inventory_audit_report.pdf");
    toast.success("PDF Report downloaded");
  };

  return (
    <AppLayout>
      <div className="space-y-6" ref={reportRef}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and download inventory audit reports</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                Reconciliation Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Complete report of all inventory items with system vs. physical count reconciliation.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-indigo-200 hover:bg-indigo-50" 
                onClick={downloadReconciliationReport}
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Discrepancy Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Filtered report showing only items with quantity discrepancies.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-orange-200 hover:bg-orange-50"
                onClick={downloadDiscrepancyReport}
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Audit Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                High-level summary of the audit with key metrics and findings.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-green-200 hover:bg-green-50"
                onClick={downloadSummaryReport}
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilePdf className="h-5 w-5 text-purple-600" />
                Complete PDF Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Complete audit report with observations and tables in PDF format.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-purple-200 hover:bg-purple-50"
                onClick={generatePDFReport}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Audit Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items Audited</p>
                <p className="text-2xl font-bold text-blue-600">{summary.auditedItems}</p>
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
            
            {/* Progress bar for audit completion */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Audit Completion</span>
                <span className="text-sm font-medium">
                  {summary.totalItems > 0 
                    ? Math.round((summary.auditedItems / summary.totalItems) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${summary.totalItems > 0 
                    ? Math.round((summary.auditedItems / summary.totalItems) * 100) 
                    : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
