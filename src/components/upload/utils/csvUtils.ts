
import { InventoryItem } from "@/context/InventoryContext";

/**
 * Process CSV text into inventory items
 */
export const processCSV = (csvText: string): InventoryItem[] => {
  // This is a simplified parser for demonstration
  // In a production app, you'd use a more robust CSV parser
  const lines = csvText.split("\n");
  const headers = lines[0].split(",");
  
  const results: InventoryItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(",");
    const item: any = {};
    
    headers.forEach((header, index) => {
      const key = header.trim();
      const value = values[index]?.trim();
      
      // Convert numeric values
      if (key === "systemQuantity" || key === "physicalQuantity") {
        item[key] = value ? parseInt(value) : 0;
      } else {
        item[key] = value || "";
      }
    });
    
    results.push(item as InventoryItem);
  }
  
  return results;
};

/**
 * Process item master data from CSV
 */
export const processItemMasterData = (items: InventoryItem[]): InventoryItem[] => {
  // For item master, ensure systemQuantity is 0 if not present
  // and ensure each item has a location
  return items.map(item => ({
    ...item,
    systemQuantity: 0,
    location: item.location || "Default"
  }));
};

/**
 * Process closing stock data from CSV
 */
export const processClosingStockData = (
  items: InventoryItem[], 
  selectedLocation?: string, 
  locations?: { id: string, name: string }[]
): InventoryItem[] => {
  let processedItems = [...items];
  
  // For auditors, filter and set location based on selection
  if (selectedLocation && locations) {
    const locationName = locations.find(loc => loc.id === selectedLocation)?.name;
    
    if (locationName) {
      // Force all items to have the selected location
      processedItems = items.map(item => ({
        ...item,
        location: locationName
      }));
    }
  }
  
  // For closing stock, ensure each item has required fields
  return processedItems.map(item => ({
    ...item,
    location: item.location || "Default",
    systemQuantity: typeof item.systemQuantity === 'number' ? item.systemQuantity : 0
  }));
};
