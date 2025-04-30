
import { useState } from "react";
import { useInventory, Location } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Building, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const LocationMaster = () => {
  const { locations, addLocation, updateLocation, deleteLocation, itemMaster } = useInventory();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState<Omit<Location, 'id'>>({
    name: "",
    description: "",
    active: true
  });
  const [editLocation, setEditLocation] = useState<Location | null>(null);

  const handleAddLocation = () => {
    if (!newLocation.name.trim()) {
      toast.error("Location name is required");
      return;
    }

    // Check for duplicate names
    if (locations.some(loc => loc.name.toLowerCase() === newLocation.name.toLowerCase())) {
      toast.error("A location with this name already exists");
      return;
    }

    try {
      addLocation(newLocation);
      setNewLocation({ name: "", description: "", active: true });
      setIsAdding(false);
      toast.success("Location added successfully");
    } catch (error) {
      toast.error("Failed to add location");
    }
  };

  const handleUpdateLocation = () => {
    if (!editLocation) return;
    
    if (!editLocation.name.trim()) {
      toast.error("Location name is required");
      return;
    }

    // Check for duplicate names (excluding the current location)
    if (locations.some(loc => 
      loc.id !== editLocation.id && 
      loc.name.toLowerCase() === editLocation.name.toLowerCase())
    ) {
      toast.error("A location with this name already exists");
      return;
    }

    try {
      updateLocation(editLocation);
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

  const getLocationItemCount = (locationName: string) => {
    return itemMaster.filter(item => item.location === locationName).length;
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
          <Card className="mb-6 border border-dashed">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Location Name*</label>
                  <Input 
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter location name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea 
                    value={newLocation.description || ''}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Active</label>
                  <Switch 
                    checked={newLocation.active}
                    onCheckedChange={(checked) => setNewLocation(prev => ({ ...prev, active: checked }))}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAdding(false)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleAddLocation}
                  >
                    <Save className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <TableRow key={location.id}>
                    {isEditing === location.id ? (
                      <>
                        <TableCell>
                          <Input 
                            value={editLocation?.name || ''}
                            onChange={(e) => setEditLocation(prev => prev ? { ...prev, name: e.target.value } : prev)}
                            className="max-w-[200px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea 
                            value={editLocation?.description || ''}
                            onChange={(e) => setEditLocation(prev => prev ? { ...prev, description: e.target.value } : prev)}
                            rows={2}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={editLocation?.active || false}
                              onCheckedChange={(checked) => setEditLocation(prev => prev ? { ...prev, active: checked } : prev)}
                            />
                            <span>{editLocation?.active ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getLocationItemCount(location.name)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" onClick={handleUpdateLocation}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {location.active ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-green-600">Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-red-600">Inactive</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getLocationItemCount(location.name)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => startEditing(location)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteLocation(location.id)}
                            disabled={getLocationItemCount(location.name) > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
