
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Location } from "@/context/InventoryContext";
import { getLocationItemCount } from "./utils/locationUtils";

interface LocationEditRowProps {
  location: Location;
  itemCount: number;
  onSave: (location: Location) => void;
  onCancel: () => void;
}

export const LocationEditRow = ({ location, itemCount, onSave, onCancel }: LocationEditRowProps) => {
  const [editedLocation, setEditedLocation] = useState<Location>(location);

  // Reset form when location changes
  useEffect(() => {
    setEditedLocation(location);
  }, [location]);

  return (
    <TableRow>
      <TableCell>
        <Input 
          value={editedLocation.name || ''}
          onChange={(e) => setEditedLocation(prev => ({ ...prev, name: e.target.value }))}
          className="max-w-[200px]"
        />
      </TableCell>
      <TableCell>
        <Textarea 
          value={editedLocation.description || ''}
          onChange={(e) => setEditedLocation(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="text-sm"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch 
            checked={editedLocation.active || false}
            onCheckedChange={(checked) => setEditedLocation(prev => ({ ...prev, active: checked }))}
          />
          <span>{editedLocation.active ? 'Active' : 'Inactive'}</span>
        </div>
      </TableCell>
      <TableCell>{itemCount}</TableCell>
      <TableCell className="text-right space-x-2">
        <Button size="sm" onClick={() => onSave(editedLocation)}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
