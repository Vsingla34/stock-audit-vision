
import { InventoryItem, useInventory } from "@/context/InventoryContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { useUserAccess } from "@/hooks/useUserAccess";

export const InventoryTable = () => {
  const { itemMaster, auditedItems } = useInventory();
  const { accessibleLocations } = useUserAccess();
  
  // Get accessible location names
  const userLocations = accessibleLocations();
  const accessibleLocationNames = userLocations.map(loc => loc.name);
  
  // Filter items by accessible locations
  const filteredItemMaster = itemMaster.filter(item => 
    userLocations.length === 0 || // Admin sees all
    accessibleLocationNames.includes(item.location)
  );
  
  const filteredAuditedItems = auditedItems.filter(item =>
    userLocations.length === 0 || // Admin sees all  
    accessibleLocationNames.includes(item.location)
  );
  
  // Combine data from filtered itemMaster and auditedItems
  const tableData = filteredItemMaster.map(item => {
    const auditedItem = filteredAuditedItems.find(a => a.id === item.id && a.location === item.location);
    if (auditedItem) {
      return {
        ...item,
        physicalQuantity: auditedItem.physicalQuantity,
        status: auditedItem.status,
        lastAudited: auditedItem.lastAudited
      };
    }
    return {
      ...item,
      physicalQuantity: 0,
      status: "pending",
      lastAudited: undefined
    };
  });

  const renderStatus = (status: string | undefined) => {
    switch(status) {
      case "matched":
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span>Matched</span>
          </div>
        );
      case "discrepancy":
        return (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            <span>Discrepancy</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            <span>Pending</span>
          </div>
        );
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">System Qty</TableHead>
            <TableHead className="text-right">Physical Qty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Audited</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((item, index) => (
            <TableRow 
              key={`${item.id}-${item.location}-${index}`}
              className={
                item.status === "discrepancy" 
                  ? "bg-red-50" 
                  : item.status === "matched" 
                    ? "bg-green-50" 
                    : ""
              }
            >
              <TableCell className="font-medium">{item.sku}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.category}</Badge>
              </TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell className="text-right">{item.systemQuantity}</TableCell>
              <TableCell className="text-right">
                {item.physicalQuantity}
              </TableCell>
              <TableCell>{renderStatus(item.status)}</TableCell>
              <TableCell>
                {item.lastAudited 
                  ? format(new Date(item.lastAudited), "dd MMM yyyy HH:mm") 
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
