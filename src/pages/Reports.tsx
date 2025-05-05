
import { AppLayout } from "@/components/layout/AppLayout";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileType, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import { useRef, useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserAccess } from "@/hooks/useUserAccess";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const Reports = () => {
  const { auditedItems, itemMaster, getInventorySummary, getLocationSummary, locations } = useInventory();
  const { currentUser } = useUser();
  const { accessibleLocations } = useUserAccess();
  const reportRef = useRef(null);
  
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [filteredAuditedItems, setFilteredAuditedItems] = useState(auditedItems);
  const [filteredItemMaster, setFilteredItemMaster] = useState(itemMaster);
  const [summary, setSummary] = useState(getInventorySummary());
  
  const userLocations = accessibleLocations();
  
  // Set initial location if user has restricted access
  useEffect(() => {
    if (currentUser?.role !== "admin" && userLocations.length > 0) {
      setSelectedLocation(userLocations[0].id);
    }
  }, [currentUser, userLocations]);
  
  // Filter data based on selected location and user role
  useEffect(() => {
    if (currentUser?.role === "admin" && !selectedLocation) {
      // Admin with no location filter - show all data
      setFilteredAuditedItems(auditedItems);
      setFilteredItemMaster(itemMaster);
      setSummary(getInventorySummary());
    } else if (selectedLocation) {
      // Filter by selected location
      const locationObj = locations.find(loc => loc.id === selectedLocation);
      
      if (locationObj) {
        const locationName = locationObj.name;
        setFilteredAuditedItems(auditedItems.filter(item => item.location === locationName));
        setFilteredItemMaster(itemMaster.filter(item => item.location === locationName));
        setSummary(getLocationSummary(locationName));
      }
    } else {
      // Default case: show all data for admin
      if (currentUser?.role === "admin") {
        setFilteredAuditedItems(auditedItems);
        setFilteredItemMaster(itemMaster);
        setSummary(getInventorySummary());
      }
    }
  }, [selectedLocation, auditedItems, itemMaster, locations, currentUser, getInventorySummary, getLocationSummary]);

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
    const reportData = filteredItemMaster.map(item => {
      const auditedItem = filteredAuditedItems.find(a => a.id === item.id && a.location === item.location);
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
    
    const locationInfo = selectedLocation ? 
      `_${locations.find(loc => loc.id === selectedLocation)?.name}` : '';
      
    generateCSV(reportData, `inventory_reconciliation_report${locationInfo}.csv`);
  };

  const downloadDiscrepancyReport = () => {
    // Filter only items with discrepancies
    const discrepancies = filteredItemMaster.map(item => {
      const auditedItem = filteredAuditedItems.find(a => a.id === item.id && a.location === item.location);
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
    
    const locationInfo = selectedLocation ? 
      `_${locations.find(loc => loc.id === selectedLocation)?.name}` : '';
      
    generateCSV(discrepancies, `discrepancy_report${locationInfo}.csv`);
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
        generatedDate: new Date().toISOString(),
        location: selectedLocation ? 
          locations.find(loc => loc.id === selectedLocation)?.name : 'All Locations'
      }
    ];
    
    const locationInfo = selectedLocation ? 
      `_${locations.find(loc => loc.id === selectedLocation)?.name}` : '';
      
    generateCSV(summaryData, `audit_summary_report${locationInfo}.csv`);
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    const reportTitle = selectedLocation 
      ? `Inventory Audit Report - ${locations.find(loc => loc.id === selectedLocation)?.name}`
      : "Inventory Audit Report - All Locations";
    
    doc.text(reportTitle, 14, 22);
    
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
    
    autoTable(doc, {
      startY: 45,
      head: [["Metric", "Value"]],
      body: summaryTableBody,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] } // Using purple theme color
    });
    
    // Add observations section
    const finalY = (doc as any)['lastAutoTable'] ? (doc as any)['lastAutoTable'].finalY : 90;
    const currentY = finalY + 10;
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
    if (filteredAuditedItems.length > 0 && !selectedLocation) {
      // Get unique locations
      const uniqueLocations = [...new Set(filteredItemMaster.map(item => item.location))];
      
      // Calculate discrepancies by location
      const locationStats = uniqueLocations.map(loc => {
        const locItems = filteredItemMaster.filter(item => item.location === loc);
        const locAudited = locItems.filter(item => 
          filteredAuditedItems.some(a => a.id === item.id && a.location === item.location)
        );
        const locDiscrepancies = locItems.filter(item => {
          const auditedItem = filteredAuditedItems.find(a => a.id === item.id && a.location === item.location);
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
    const discrepancies = filteredItemMaster
      .map(item => {
        const auditedItem = filteredAuditedItems.find(a => a.id === item.id && a.location === item.location);
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
      
      autoTable(doc, {
        startY: discrepancyY + 5,
        head: [["SKU", "Name", "Location", "System Qty", "Physical Qty", "Variance"]],
        body: discrepancies,
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] }, // Orange for warnings
        styles: { fontSize: 9 }
      });
    }
    
    const locationInfo = selectedLocation ? 
      `_${locations.find(loc => loc.id === selectedLocation)?.name}` : '';
      
    doc.save(`inventory_audit_report${locationInfo}.pdf`);
    toast.success("PDF Report downloaded");
  };

  // New function to display data in table
  const getDataForTable = () => {
    // Combine item master with audited items
    return filteredItemMaster.map(item => {
      const auditedItem = filteredAuditedItems.find(a => a.id === item.id && a.location === item.location);
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
  };

  const tableData = getDataForTable();

  return (
    <AppLayout>
      <div className="space-y-6" ref={reportRef}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Generate and download inventory audit reports</p>
          </div>
          
          {/* Location selector */}
          <div className="w-64">
            <Select 
              value={selectedLocation} 
              onValueChange={setSelectedLocation}
              disabled={currentUser?.role !== "admin" && userLocations.length <= 1}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  currentUser?.role === "admin" ? 
                    "All Locations" : 
                    userLocations.length ? userLocations[0].name : "No locations"
                } />
              </SelectTrigger>
              <SelectContent>
                {currentUser?.role === "admin" && (
                  <SelectItem value="all-locations">All Locations</SelectItem>
                )}
                {userLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                <FileType className="h-5 w-5 text-purple-600" />
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

        {/* Add a table view of the report data */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Detailed Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>System Qty</TableHead>
                    <TableHead>Physical Qty</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.length > 0 ? (
                    tableData.map((item) => (
                      <TableRow key={`${item.id}-${item.location}`}>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.systemQuantity}</TableCell>
                        <TableCell>{item.physicalQuantity}</TableCell>
                        <TableCell className={item.variance !== 0 ? "text-red-600 font-medium" : ""}>{item.variance}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'matched' ? 'bg-green-100 text-green-800' : 
                            item.status === 'discrepancy' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status === 'matched' ? 'Matched' : 
                             item.status === 'discrepancy' ? 'Discrepancy' : 
                             'Pending'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
