
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { InventoryItem } from "@/context/InventoryContext";

export const FileUploader = () => {
  const [itemMasterFile, setItemMasterFile] = useState<File | null>(null);
  const [closingStockFile, setClosingStockFile] = useState<File | null>(null);
  const { setItemMaster, setClosingStock } = useInventory();

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
      if (itemMasterFile) {
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
      
      if (closingStockFile) {
        const text = await closingStockFile.text();
        const items = processCSV(text);
        
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

      <Card>
        <CardHeader>
          <CardTitle>Upload Closing Stock Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="mb-4 text-sm text-muted-foreground">
              Upload your Closing Stock CSV file (with quantities)
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

      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <Button 
            className="w-full" 
            disabled={!itemMasterFile && !closingStockFile}
            onClick={handleImport}
          >
            Import Selected Files
          </Button>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-1">File Format Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>CSV files only</li>
              <li>First row must contain column headers</li>
              <li>Required columns for Item Master: id, sku, name, category, location</li>
              <li>Required columns for Closing Stock: id, sku, systemQuantity, location</li>
              <li>Multiple locations are supported - items with the same SKU but different locations will be treated as separate inventory items</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
