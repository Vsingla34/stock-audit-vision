
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

export const InventoryTable = () => {
  const { itemMaster, auditedItems } = useInventory();
  
  // Combine data from itemMaster and auditedItems
  const tableData = itemMaster.map(item => {
    const auditedItem = auditedItems.find(a => a.id === item.id);
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
          {tableData.map((item) => (
            <TableRow 
              key={item.id}
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
