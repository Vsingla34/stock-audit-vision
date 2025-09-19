
import { InventoryItem } from "@/context/InventoryContext";

/**
 * Process CSV text into inventory items
 */
export const processCSV = (csvText: string): InventoryItem[] => {
  if (!csvText || !csvText.trim()) {
    return [];
  }

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return [];
  }

  // Parse CSV headers - handle quoted fields
  const headers = parseCSVLine(lines[0]);
  const results: InventoryItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length !== headers.length) continue;
    
    const item: any = {
      id: `item_${Date.now()}_${i}`, // Generate unique ID if missing
    };
    
    headers.forEach((header, index) => {
      const key = header.trim().toLowerCase();
      const value = values[index]?.trim() || "";
      
      // Map common column variations
      if (key === "systemquantity" || key === "system_quantity" || key === "quantity") {
        item.systemQuantity = value ? parseInt(value) || 0 : 0;
      } else if (key === "physicalquantity" || key === "physical_quantity") {
        item.physicalQuantity = value ? parseInt(value) || 0 : 0;
      } else if (key === "id" || key === "item_id") {
        item.id = value || item.id;
      } else if (key === "sku") {
        item.sku = value;
      } else if (key === "name" || key === "item_name" || key === "product_name") {
        item.name = value;
      } else if (key === "category") {
        item.category = value;
      } else if (key === "location") {
        item.location = value;
      }
    });
    
    // Ensure required fields
    if (item.sku) {
      results.push(item as InventoryItem);
    }
  }
  
  return results;
};

// Helper function to parse CSV line handling quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i - 1] === ',')) {
      inQuotes = true;
    } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

/**
 * Process item master data from CSV
 */
export const processItemMasterData = (items: InventoryItem[]): InventoryItem[] => {
  return items.map((item, index) => ({
    ...item,
    id: item.id || `item_${Date.now()}_${index}`,
    sku: item.sku || `SKU_${index}`,
    name: item.name || `Item ${index}`,
    systemQuantity: item.systemQuantity || 0,
    location: item.location || "Default",
    status: 'pending' as const
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
  
  // For auditors, set location based on selection
  if (selectedLocation && selectedLocation !== "default" && locations) {
    const locationName = locations.find(loc => loc.id === selectedLocation)?.name;
    
    if (locationName) {
      processedItems = items.map(item => ({
        ...item,
        location: locationName
      }));
    }
  }
  
  // Process closing stock items
  return processedItems.map((item, index) => ({
    ...item,
    id: item.id || `item_${Date.now()}_${index}`,
    sku: item.sku || `SKU_${index}`,
    name: item.name || `Item ${index}`,
    location: item.location || "Default",
    systemQuantity: item.systemQuantity || 0,
    physicalQuantity: item.physicalQuantity,
    status: 'pending' as const
  }));
};
