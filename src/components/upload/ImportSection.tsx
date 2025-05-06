
import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Info } from "lucide-react";

interface ImportSectionProps {
  canUploadItemMaster: boolean;
  canUploadClosingStock: boolean;
  showLocationInfo?: boolean;
}

export const ImportSection: FC<ImportSectionProps> = ({
  canUploadItemMaster,
  canUploadClosingStock,
  showLocationInfo = false
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Info className="h-4 w-4 mr-2" />
          Import Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1 mb-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">File Format Requirements:</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>CSV files only with clear column headers in the first row</li>
            {canUploadItemMaster && (
              <li className="pl-2">
                <span className="font-medium">Item Master:</span> Required columns: id, sku, name, category, location
              </li>
            )}
            {canUploadClosingStock && (
              <li className="pl-2">
                <span className="font-medium">Closing Stock:</span> Required columns: id, sku, systemQuantity
                {!showLocationInfo && ", location"}
              </li>
            )}
            {canUploadItemMaster && canUploadClosingStock && (
              <li className="pt-1">Multiple locations are supported - items with the same SKU but different locations will be treated as separate inventory items</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
