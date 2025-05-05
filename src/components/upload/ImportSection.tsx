
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ImportSectionProps {
  onImport: () => void;
  disabled: boolean;
  canUploadItemMaster: boolean;
  canUploadClosingStock: boolean;
  showLocationInfo?: boolean;
}

export const ImportSection: FC<ImportSectionProps> = ({
  onImport,
  disabled,
  canUploadItemMaster,
  canUploadClosingStock,
  showLocationInfo = false
}) => {
  return (
    <Card className="md:col-span-2">
      <CardContent className="pt-6">
        <Button 
          className="w-full" 
          disabled={disabled}
          onClick={onImport}
        >
          Import Selected Files
        </Button>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium mb-1">File Format Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>CSV files only</li>
            <li>First row must contain column headers</li>
            {canUploadItemMaster && <li>Required columns for Item Master: id, sku, name, category, location</li>}
            {canUploadClosingStock && (
              <li>
                Required columns for Closing Stock: id, sku, systemQuantity
                {!showLocationInfo && ", location"}
              </li>
            )}
            {canUploadItemMaster && canUploadClosingStock && (
              <li>Multiple locations are supported - items with the same SKU but different locations will be treated as separate inventory items</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
