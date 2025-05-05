
import React, { createContext, useContext, useState, useEffect } from "react";
import DataPersistenceService from "@/services/DataPersistenceService";

// Define types for inventory items
export interface InventoryItem {
  id: string;
  sku: string;
  name?: string;
  category?: string;
  location: string;
  systemQuantity: number;
  physicalQuantity?: number;
  status?: 'pending' | 'matched' | 'discrepancy';
  lastAudited?: string;
  notes?: string;
}

export interface Location {
  id: string;
  name: string;
}

// Define the context interface
interface InventoryContextType {
  itemMaster: InventoryItem[];
  closingStock: InventoryItem[];
  auditedItems: InventoryItem[];
  locations: Location[];
  setItemMaster: (items: InventoryItem[]) => void;
  setClosingStock: (items: InventoryItem[]) => void;
  updateAuditedItem: (item: InventoryItem) => void;
  getInventorySummary: () => {
    totalItems: number;
    auditedItems: number;
    pendingItems: number;
    matched: number;
    discrepancies: number;
  };
  getLocationSummary: (location: string) => {
    totalItems: number;
    auditedItems: number;
    pendingItems: number;
    matched: number;
    discrepancies: number;
  };
  clearAllData: () => void;
}

// Create the context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Provider component
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itemMaster, setItemMasterState] = useState<InventoryItem[]>([]);
  const [closingStock, setClosingStockState] = useState<InventoryItem[]>([]);
  const [auditedItems, setAuditedItemsState] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  
  // Load data from persistence service on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setItemMasterState(DataPersistenceService.getItemMaster());
        setClosingStockState(DataPersistenceService.getClosingStock());
        setAuditedItemsState(DataPersistenceService.getAuditedItems());
        setLocations(DataPersistenceService.getLocations());
      } catch (error) {
        console.error("Error loading inventory data:", error);
      }
    };
    
    loadData();
  }, []);
  
  // Set item master with persistence
  const setItemMaster = (items: InventoryItem[]) => {
    setItemMasterState(items);
    DataPersistenceService.setItemMaster(items);
  };
  
  // Set closing stock with persistence
  const setClosingStock = (items: InventoryItem[]) => {
    setClosingStockState(items);
    DataPersistenceService.setClosingStock(items);
  };
  
  // Update a single audited item
  const updateAuditedItem = (item: InventoryItem) => {
    const newAuditedItems = [...auditedItems];
    const index = newAuditedItems.findIndex(i => i.id === item.id && i.location === item.location);
    
    if (index >= 0) {
      newAuditedItems[index] = {
        ...newAuditedItems[index],
        ...item,
        lastAudited: new Date().toISOString()
      };
    } else {
      newAuditedItems.push({
        ...item,
        lastAudited: new Date().toISOString()
      });
    }
    
    setAuditedItemsState(newAuditedItems);
    DataPersistenceService.setAuditedItems(newAuditedItems);
  };
  
  // Calculate summary for all inventory
  const getInventorySummary = () => {
    const totalItems = itemMaster.length;
    const auditedItemsCount = auditedItems.length;
    const matchedItems = auditedItems.filter(item => item.status === 'matched').length;
    const discrepancies = auditedItems.filter(item => item.status === 'discrepancy').length;
    
    return {
      totalItems,
      auditedItems: auditedItemsCount,
      pendingItems: totalItems - auditedItemsCount,
      matched: matchedItems,
      discrepancies
    };
  };
  
  // Calculate summary for a specific location
  const getLocationSummary = (location: string) => {
    const locationItems = itemMaster.filter(item => item.location === location);
    const locationAuditedItems = auditedItems.filter(item => item.location === location);
    const totalItems = locationItems.length;
    const auditedItemsCount = locationAuditedItems.length;
    const matchedItems = locationAuditedItems.filter(item => item.status === 'matched').length;
    const discrepancies = locationAuditedItems.filter(item => item.status === 'discrepancy').length;
    
    return {
      totalItems,
      auditedItems: auditedItemsCount,
      pendingItems: totalItems - auditedItemsCount,
      matched: matchedItems,
      discrepancies
    };
  };
  
  // Clear all data
  const clearAllData = () => {
    setItemMasterState([]);
    setClosingStockState([]);
    setAuditedItemsState([]);
    DataPersistenceService.clearInventoryData();
  };
  
  return (
    <InventoryContext.Provider
      value={{
        itemMaster,
        closingStock,
        auditedItems,
        locations,
        setItemMaster,
        setClosingStock,
        updateAuditedItem,
        getInventorySummary,
        getLocationSummary,
        clearAllData
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

// Custom hook for using the inventory context
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
