
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building } from "lucide-react";

export const LocationAuditSummary = () => {
  const { locations, getLocationSummary } = useInventory();
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  
  const locationSummary = selectedLocation 
    ? getLocationSummary(selectedLocation)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          <span>Location Audit Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={selectedLocation}
            onValueChange={setSelectedLocation}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {locationSummary ? (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="text-sm text-blue-600">Total Items</div>
                <div className="text-2xl font-bold">{locationSummary.totalItems}</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <div className="text-sm text-green-600">Audited Items</div>
                <div className="text-2xl font-bold">{locationSummary.auditedItems}</div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4">
                <div className="text-sm text-yellow-600">Pending Items</div>
                <div className="text-2xl font-bold">{locationSummary.pendingItems}</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-4">
                <div className="text-sm text-purple-600">Match Rate</div>
                <div className="text-2xl font-bold">
                  {locationSummary.auditedItems > 0
                    ? `${Math.round((locationSummary.matched / locationSummary.auditedItems) * 100)}%`
                    : "N/A"}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Select a location to view its audit summary
            </div>
          )}
          
          {locationSummary && locationSummary.auditedItems > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round((locationSummary.auditedItems / locationSummary.totalItems) * 100)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-600"
                  style={{
                    width: `${(locationSummary.auditedItems / locationSummary.totalItems) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
