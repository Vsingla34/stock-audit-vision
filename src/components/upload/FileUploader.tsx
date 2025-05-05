
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { InventoryItem, Location } from "@/context/InventoryContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FileUploaderProps {
  userRole: 'admin' | 'auditor' | 'client';
  assignedLocations?: string[];
  canUploadItemMaster?: boolean;
  canUploadClosingStock?: boolean;
}

export const FileUploader = ({ 
  userRole, 
  assignedLocations = [], 
  canUploadItemMaster = false, 
  canUploadClosingStock = false 
}: FileUploaderProps) => {
  const [itemMasterFile, setItemMasterFile] = useState<File | null>(null);
  const [closingStockFile, setClosingStockFile] = useState<File | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const { setItemMaster, setClosingStock, locations } = useInventory();

  // Filter locations based on user role and assignments
  const accessibleLocations = locations.filter(location => 
    userRole === "admin" || 
    (assignedLocations && assignedLocations.includes(location.id))
  );

  const handleItemMasterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setItemMasterFile(e.target.files[0]);
    }
  };

  const handleClosingStockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setClosingStockFile(e.target.files[0]);
    }
  };

  const processCSV = (csvText: string): InventoryItem[] => {
    // This is a simplified parser for demonstration
    // In a production app, you'd use a more robust CSV parser
    const lines = csvText.split("\n");
    const headers = lines[0].split(",");
    
    const results: InventoryItem[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(",");
      const item: any = {};
      
      headers.forEach((header, index) => {
        const key = header.trim();
        const value = values[index]?.trim();
        
        // Convert numeric values
        if (key === "systemQuantity" || key === "physicalQuantity") {
          item[key] = value ? parseInt(value) : 0;
        } else {
          item[key] = value || "";
        }
      });
      
      results.push(item as InventoryItem);
    }
    
    return results;
  };

  const handleImport = async () => {
    try {
      // For admins: Item Master upload
      if (canUploadItemMaster && itemMasterFile) {
        const text = await itemMasterFile.text();
        const items = processCSV(text);
        
        // For item master, ensure systemQuantity is 0 if not present
        // and ensure each item has a location
        const processedItems = items.map(item => ({
          ...item,
          systemQuantity: 0,
          location: item.location || "Default"
        }));
        
        setItemMaster(processedItems);
        
        toast.success("Item master data imported", {
          description: `Successfully imported ${processedItems.length} items.`
        });
      }
      
      // Closing Stock upload (both admin and auditor)
      if (canUploadClosingStock && closingStockFile) {
        const text = await closingStockFile.text();
        let items = processCSV(text);
        
        // For auditors, filter and set location based on selection
        if (userRole === "auditor") {
          if (!selectedLocation) {
            toast.error("Please select a location");
            return;
          }
          
          const locationName = locations.find(loc => loc.id === selectedLocation)?.name;
          if (!locationName) {
            toast.error("Invalid location selected");
            return;
          }
          
          // Force all items to have the selected location
          items = items.map(item => ({
            ...item,
            location: locationName
          }));
        }
        
        // For closing stock, ensure each item has required fields
        const processedItems = items.map(item => ({
          ...item,
          location: item.location || "Default",
          systemQuantity: typeof item.systemQuantity === 'number' ? item.systemQuantity : 0
        }));
        
        setClosingStock(processedItems);
        
        toast.success("Closing stock data imported", {
          description: `Successfully imported ${processedItems.length} items.`
        });
      }
    } catch (error) {
      toast.error("Import failed", {
        description: "There was an error processing your file."
      });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Item Master Upload - Admin Only */}
      {canUploadItemMaster && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Item Master Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="mb-4 text-sm text-muted-foreground">
                Upload your Item Master CSV file (without quantities)
              </p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="itemMasterUpload"
                onChange={handleItemMasterUpload}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("itemMasterUpload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
              {itemMasterFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: {itemMasterFile.name}
                  <Check className="inline-block ml-1 h-4 w-4 text-green-500" />
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closing Stock Upload - Admin & Auditors */}
      {canUploadClosingStock && (
        <Card className={!canUploadItemMaster ? "md:col-span-2" : ""}>
          <CardHeader>
            <CardTitle>Upload Closing Stock Data</CardTitle>
          </CardHeader>
          <CardContent>
            {userRole === "auditor" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Location:</label>
                <Select 
                  value={selectedLocation} 
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessibleLocations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="mb-4 text-sm text-muted-foreground">
                Upload your Closing Stock CSV file (with quantities)
                {userRole === "auditor" && " for the selected location"}
              </p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="closingStockUpload"
                onChange={handleClosingStockUpload}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("closingStockUpload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
              {closingStockFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: {closingStockFile.name}
                  <Check className="inline-block ml-1 h-4 w-4 text-green-500" />
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(canUploadItemMaster || canUploadClosingStock) && (
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <Button 
              className="w-full" 
              disabled={
                (canUploadItemMaster && canUploadClosingStock) ? (!itemMasterFile && !closingStockFile) :
                canUploadItemMaster ? !itemMasterFile :
                canUploadClosingStock ? (userRole === "auditor" ? (!closingStockFile || !selectedLocation) : !closingStockFile) :
                true
              }
              onClick={handleImport}
            >
              Import Selected Files
            </Button>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium mb-1">File Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>CSV files only</li>
                <li>First row must contain column headers</li>
                {canUploadItemMaster && <li>Required columns for Item Master: id, sku, name, category, location</li>}
                {canUploadClosingStock && <li>Required columns for Closing Stock: id, sku, systemQuantity{userRole === "auditor" ? "" : ", location"}</li>}
                {canUploadItemMaster && canUploadClosingStock && (
                  <li>Multiple locations are supported - items with the same SKU but different locations will be treated as separate inventory items</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {!canUploadItemMaster && !canUploadClosingStock && (
        <Card className="md:col-span-2 p-6">
          <p className="text-center text-muted-foreground">You don't have permission to upload inventory data.</p>
        </Card>
      )}
    </div>
  );
};

