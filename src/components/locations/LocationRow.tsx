
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Location } from "@/context/InventoryContext";
import { Edit, Trash2 } from "lucide-react";
import { CheckIcon, XIcon } from "lucide-react";

interface LocationRowProps {
  location: Location;
  itemCount: number;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
}

export const LocationRow = ({ location, itemCount, onEdit, onDelete }: LocationRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{location.name}</TableCell>
      <TableCell>{location.description || '-'}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {location.active ? (
            <>
              <CheckIcon className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Active</span>
            </>
          ) : (
            <>
              <XIcon className="h-4 w-4 text-red-500" />
              <span className="text-red-600">Inactive</span>
            </>
          )}
        </div>
      </TableCell>
      <TableCell>{itemCount}</TableCell>
      <TableCell className="text-right space-x-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onEdit(location)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-red-600 hover:text-red-700"
          onClick={() => onDelete(location.id)}
          disabled={itemCount > 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
