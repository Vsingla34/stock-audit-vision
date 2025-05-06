
import { FC } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Location } from "@/context/InventoryContext";

interface LocationSelectorProps {
  locations: Location[];
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const LocationSelector: FC<LocationSelectorProps> = ({
  locations,
  selectedLocation,
  onLocationChange,
  placeholder = "Choose a location",
  className
}) => {
  if (!locations || locations.length === 0) {
    return (
      <div className={`mb-4 ${className || ''}`}>
        <label className="block text-sm font-medium mb-2">Select Location:</label>
        <div className="text-sm text-muted-foreground">No locations available</div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className || ''}`}>
      <label className="block text-sm font-medium mb-2">Select Location:</label>
      <Select 
        value={selectedLocation} 
        onValueChange={onLocationChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">{placeholder}</SelectItem>
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
