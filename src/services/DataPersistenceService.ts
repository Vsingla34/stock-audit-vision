
import { InventoryItem, Location } from "@/context/InventoryContext";

// Interface for database tables
export interface DatabaseTables {
  itemMaster: InventoryItem[];
  closingStock: InventoryItem[];
  auditedItems: InventoryItem[];
  locations: Location[];
  users: any[];
}

// Mock database tables (in a real implementation this would be replaced with API calls)
const localStorageKey = 'stockAuditVisionDB';

// Initialize database if it doesn't exist
const initializeDB = (): DatabaseTables => {
  const existingDB = localStorage.getItem(localStorageKey);
  
  if (existingDB) {
    return JSON.parse(existingDB);
  }
  
  // Create initial structure
  const initialDB: DatabaseTables = {
    itemMaster: [],
    closingStock: [],
    auditedItems: [],
    locations: [
      { id: 'loc1', name: 'Warehouse A' },
      { id: 'loc2', name: 'Warehouse B' },
      { id: 'loc3', name: 'Store C' }
    ],
    users: [
      {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        assignedLocations: ['loc1', 'loc2', 'loc3']
      },
      {
        id: 'auditor1', 
        name: 'Auditor User',
        email: 'auditor@example.com',
        role: 'auditor',
        assignedLocations: ['loc1']
      },
      {
        id: 'client1',
        name: 'Client User',
        email: 'client@example.com',
        role: 'client',
        assignedLocations: ['loc1', 'loc2']
      }
    ]
  };
  
  // Save to localStorage
  localStorage.setItem(localStorageKey, JSON.stringify(initialDB));
  
  return initialDB;
};

// Data persistence service
export const DataPersistenceService = {
  // Get all data
  getAllData: (): DatabaseTables => {
    return initializeDB();
  },
  
  // Get item master data
  getItemMaster: (): InventoryItem[] => {
    const db = initializeDB();
    return db.itemMaster;
  },
  
  // Set item master data
  setItemMaster: (items: InventoryItem[]): void => {
    const db = initializeDB();
    db.itemMaster = items;
    localStorage.setItem(localStorageKey, JSON.stringify(db));
    console.log('Item master data saved to backend', items);
  },
  
  // Get closing stock data
  getClosingStock: (): InventoryItem[] => {
    const db = initializeDB();
    return db.closingStock;
  },
  
  // Set closing stock data
  setClosingStock: (items: InventoryItem[]): void => {
    const db = initializeDB();
    db.closingStock = items;
    localStorage.setItem(localStorageKey, JSON.stringify(db));
    console.log('Closing stock data saved to backend', items);
  },
  
  // Get audited items
  getAuditedItems: (): InventoryItem[] => {
    const db = initializeDB();
    return db.auditedItems;
  },
  
  // Set audited items
  setAuditedItems: (items: InventoryItem[]): void => {
    const db = initializeDB();
    db.auditedItems = items;
    localStorage.setItem(localStorageKey, JSON.stringify(db));
    console.log('Audited items saved to backend', items);
  },
  
  // Add or update an audited item
  updateAuditedItem: (item: InventoryItem): void => {
    const db = initializeDB();
    
    // Find existing item by ID and location
    const existingIndex = db.auditedItems.findIndex(
      i => i.id === item.id && i.location === item.location
    );
    
    if (existingIndex >= 0) {
      // Update existing item
      db.auditedItems[existingIndex] = {
        ...db.auditedItems[existingIndex],
        ...item,
        lastAudited: new Date().toISOString()
      };
    } else {
      // Add new item
      db.auditedItems.push({
        ...item,
        lastAudited: new Date().toISOString()
      });
    }
    
    localStorage.setItem(localStorageKey, JSON.stringify(db));
  },
  
  // Get locations
  getLocations: (): Location[] => {
    const db = initializeDB();
    return db.locations;
  },
  
  // Add or update a location
  updateLocation: (location: Location): void => {
    const db = initializeDB();
    
    const existingIndex = db.locations.findIndex(loc => loc.id === location.id);
    
    if (existingIndex >= 0) {
      db.locations[existingIndex] = location;
    } else {
      db.locations.push(location);
    }
    
    localStorage.setItem(localStorageKey, JSON.stringify(db));
  },
  
  // Delete a location
  deleteLocation: (locationId: string): void => {
    const db = initializeDB();
    db.locations = db.locations.filter(loc => loc.id !== locationId);
    localStorage.setItem(localStorageKey, JSON.stringify(db));
  },
  
  // Clear all inventory data
  clearInventoryData: (): void => {
    const db = initializeDB();
    db.itemMaster = [];
    db.closingStock = [];
    db.auditedItems = [];
    localStorage.setItem(localStorageKey, JSON.stringify(db));
    console.log('All inventory data cleared');
  }
};

export default DataPersistenceService;
