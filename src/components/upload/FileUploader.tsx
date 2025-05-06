
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { toast } from "sonner";
import { FileInputCard } from "./FileInputCard";
import { LocationSelector } from "./LocationSelector";
import { ImportSection } from "./ImportSection";
import { NoPermissionCard } from "./NoPermissionCard";
import { processCSV, processItemMasterData, processClosingStockData } from "./utils/csvUtils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  const [selectedLocation, setSelectedLocation] = useState<string>("default");
  const [isImporting, setIsImporting] = useState(false);
  const { setItemMaster, setClosingStock, locations } = useInventory();

  // Filter locations based on user role and assignments
  const accessibleLocations = locations.filter(location => 
    userRole === "admin" || 
    (assignedLocations && assignedLocations.includes(location.id))
  );

  const handleItemMasterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast.error("Invalid file format", {
          description: "Please upload a CSV file"
        });
        return;
      }
      setItemMasterFile(file);
    }
  };

  const handleClosingStockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast.error("Invalid file format", {
          description: "Please upload a CSV file"
        });
        return;
      }
      setClosingStockFile(file);
    }
  };

  const handleImport = async () => {
    // For auditors, we need to validate location selection
    if (userRole === "auditor" && canUploadClosingStock && closingStockFile && 
        (!selectedLocation || selectedLocation === "default")) {
      toast.error("Please select a location");
      return;
    }

    setIsImporting(true);
    
    try {
      // For admins: Item Master upload
      if (canUploadItemMaster && itemMasterFile) {
        const text = await itemMasterFile.text();
        const items = processCSV(text);
        
        if (items.length === 0) {
          toast.error("Invalid file format or empty file");
          setIsImporting(false);
          return;
        }
        
        const processedItems = processItemMasterData(items);
        
        setItemMaster(processedItems);
        
        toast.success("Item master data imported", {
          description: `Successfully imported ${processedItems.length} items.`
        });
      }
      
      // Closing Stock upload (both admin and auditor)
      if (canUploadClosingStock && closingStockFile) {
        const text = await closingStockFile.text();
        let items = processCSV(text);
        
        if (items.length === 0) {
          toast.error("Invalid file format or empty file");
          setIsImporting(false);
          return;
        }
        
        const locationToUse = userRole === "auditor" ? selectedLocation : undefined;
        const processedItems = processClosingStockData(
          items,
          locationToUse,
          locations
        );
        
        setClosingStock(processedItems);
        
        toast.success("Closing stock data imported", {
          description: `Successfully imported ${processedItems.length} items.`
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Import failed", {
        description: "There was an error processing your file."
      });
    } finally {
      setIsImporting(false);
    }
  };

  const isImportButtonDisabled = () => {
    if (isImporting) return true;
    
    if (canUploadItemMaster && canUploadClosingStock) {
      return !itemMasterFile && !closingStockFile;
    }
    if (canUploadItemMaster) {
      return !itemMasterFile;
    }
    if (canUploadClosingStock) {
      return userRole === "auditor" ? 
        (!closingStockFile || !selectedLocation || selectedLocation === "default") : 
        !closingStockFile;
    }
    return true;
  };

  if (!canUploadItemMaster && !canUploadClosingStock) {
    return <NoPermissionCard />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Item Master Upload - Admin Only */}
      {canUploadItemMaster && (
        <FileInputCard
          title="Upload Item Master Data"
          description="Upload your Item Master CSV file (without quantities)"
          fileInputId="itemMasterUpload"
          file={itemMasterFile}
          onFileChange={handleItemMasterUpload}
        />
      )}

      {/* Closing Stock Upload - Admin & Auditors */}
      {canUploadClosingStock && (
        <div className={!canUploadItemMaster ? "md:col-span-2" : ""}>
          <FileInputCard
            title="Upload Closing Stock Data"
            description={`Upload your Closing Stock CSV file (with quantities)${userRole === "auditor" ? " for the selected location" : ""}`}
            fileInputId="closingStockUpload"
            file={closingStockFile}
            onFileChange={handleClosingStockUpload}
          />
          
          {userRole === "auditor" && accessibleLocations.length > 0 && (
            <div className="mt-4">
              <LocationSelector
                locations={accessibleLocations}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
                placeholder="Select location for upload"
              />
            </div>
          )}
        </div>
      )}

      {/* Import Button and Format Instructions */}
      {(canUploadItemMaster || canUploadClosingStock) && (
        <div className="md:col-span-2">
          <div className="flex justify-center mb-4">
            <Button 
              className="w-full max-w-md" 
              disabled={isImportButtonDisabled()}
              onClick={handleImport}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>Import Selected Files</>
              )}
            </Button>
          </div>
          <ImportSection
            canUploadItemMaster={canUploadItemMaster}
            canUploadClosingStock={canUploadClosingStock}
            showLocationInfo={userRole === "auditor"}
          />
        </div>
      )}
    </div>
  );
};
