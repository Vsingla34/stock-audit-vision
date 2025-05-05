
import { InventoryItem, Location } from "@/context/InventoryContext";

export const isLocationNameDuplicate = (
  locations: Location[], 
  name: string, 
  excludeLocationId?: string
): boolean => {
  return locations.some(loc => 
    loc.name.toLowerCase() === name.toLowerCase() && 
    (!excludeLocationId || loc.id !== excludeLocationId)
  );
};

export const getLocationItemCount = (itemMaster: InventoryItem[], locationName: string): number => {
  return itemMaster.filter(item => item.location === locationName).length;
};
