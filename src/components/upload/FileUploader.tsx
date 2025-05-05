
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { toast } from "sonner";
import { FileInputCard } from "./FileInputCard";
import { LocationSelector } from "./LocationSelector";
import { ImportSection } from "./ImportSection";
import { NoPermissionCard } from "./NoPermissionCard";
import { processCSV, processItemMasterData, processClosingStockData } from "./utils/csvUtils";

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

  const handleImport = async () => {
    try {
      // For admins: Item Master upload
      if (canUploadItemMaster && itemMasterFile) {
        const text = await itemMasterFile.text();
        const items = processCSV(text);
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
        
        // For auditors, we need to validate location selection
        if (userRole === "auditor" && !selectedLocation) {
          toast.error("Please select a location");
          return;
        }
        
        const processedItems = processClosingStockData(
          items,
          userRole === "auditor" ? selectedLocation : undefined,
          userRole === "auditor" ? locations : undefined
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
    }
  };

  const isImportButtonDisabled = () => {
    if (canUploadItemMaster && canUploadClosingStock) {
      return !itemMasterFile && !closingStockFile;
    }
    if (canUploadItemMaster) {
      return !itemMasterFile;
    }
    if (canUploadClosingStock) {
      return userRole === "auditor" ? (!closingStockFile || !selectedLocation) : !closingStockFile;
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
          
          {userRole === "auditor" && (
            <div className="mt-4">
              <LocationSelector
                locations={accessibleLocations}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
              />
            </div>
          )}
        </div>
      )}

      {/* Import Button and Format Instructions */}
      {(canUploadItemMaster || canUploadClosingStock) && (
        <ImportSection
          onImport={handleImport}
          disabled={isImportButtonDisabled()}
          canUploadItemMaster={canUploadItemMaster}
          canUploadClosingStock={canUploadClosingStock}
          showLocationInfo={userRole === "auditor"}
        />
      )}
    </div>
  );
};
