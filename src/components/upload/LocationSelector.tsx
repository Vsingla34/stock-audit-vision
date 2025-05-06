
import { FC } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Location } from "@/context/InventoryContext";

interface LocationSelectorProps {
  locations: Location[];
  selectedLocation: string;
  onLocationChange: (value: string) => void;
}

export const LocationSelector: FC<LocationSelectorProps> = ({
  locations,
  selectedLocation,
  onLocationChange
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Select Location:</label>
      <Select 
        value={selectedLocation} 
        onValueChange={onLocationChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Choose a location</SelectItem>
          {locations.map(loc => (
            <SelectItem key={loc.id} value={loc.id}>
              {loc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
