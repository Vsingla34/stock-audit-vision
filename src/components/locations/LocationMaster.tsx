
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LocationForm } from "./LocationForm";
import { LocationRow } from "./LocationRow";
import { LocationEditRow } from "./LocationEditRow";
import { isLocationNameDuplicate, getLocationItemCount } from "./utils/locationUtils";
import type { Location } from "@/context/InventoryContext";

export const LocationMaster = () => {
  const { locations, addLocation, updateLocation, deleteLocation, itemMaster } = useInventory();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState<Location | null>(null);

  const handleAddLocation = (newLocation: Omit<Location, 'id'>) => {
    try {
      addLocation(newLocation);
      setIsAdding(false);
    } catch (error) {
      toast.error("Failed to add location");
    }
  };

  const handleUpdateLocation = (location: Location) => {
    if (!location.name.trim()) {
      toast.error("Location name is required");
      return;
    }

    // Check for duplicate names (excluding the current location)
    if (isLocationNameDuplicate(locations, location.name, location.id)) {
      toast.error("A location with this name already exists");
      return;
    }

    try {
      updateLocation(location);
      setIsEditing(null);
      setEditLocation(null);
      toast.success("Location updated successfully");
    } catch (error) {
      toast.error("Failed to update location");
    }
  };

  const handleDeleteLocation = (id: string) => {
    try {
      deleteLocation(id);
      toast.success("Location deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete location");
    }
  };

  const startEditing = (location: Location) => {
    setIsEditing(location.id);
    setEditLocation({ ...location });
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditLocation(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <span>Location Master</span>
          </div>
          {!isAdding && (
            <Button 
              onClick={() => setIsAdding(true)} 
              size="sm" 
              className="h-8"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Location
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <LocationForm
            locations={locations}
            onSave={handleAddLocation}
            onCancel={() => setIsAdding(false)}
          />
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No locations found. Add a location to get started.
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  isEditing === location.id && editLocation ? (
                    <LocationEditRow
                      key={location.id}
                      location={editLocation}
                      itemCount={getLocationItemCount(itemMaster, location.name)}
                      onSave={handleUpdateLocation}
                      onCancel={cancelEditing}
                    />
                  ) : (
                    <LocationRow
                      key={location.id}
                      location={location}
                      itemCount={getLocationItemCount(itemMaster, location.name)}
                      onEdit={startEditing}
                      onDelete={handleDeleteLocation}
                    />
                  )
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
