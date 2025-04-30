
import React, { createContext, useContext, useState, useEffect } from "react";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  systemQuantity: number;
  physicalQuantity: number;
  location: string;
  lastAudited?: string;
  status?: "pending" | "matched" | "discrepancy";
}

interface InventoryContextType {
  itemMaster: InventoryItem[];
  setItemMaster: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  closingStock: InventoryItem[];
  setClosingStock: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  auditedItems: InventoryItem[];
  setAuditedItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  scanItem: (barcode: string, location: string) => void;
  searchItem: (query: string) => InventoryItem[];
  addItemToAudit: (item: InventoryItem, quantity: number) => void;
  getInventorySummary: () => InventorySummary;
}

export interface InventorySummary {
  totalItems: number;
  auditedItems: number;
  pendingItems: number;
  matched: number;
  discrepancies: number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  ITEM_MASTER: 'inventory-item-master',
  CLOSING_STOCK: 'inventory-closing-stock',
  AUDITED_ITEMS: 'inventory-audited-items'
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sample data for demonstration
  const [itemMaster, setItemMaster] = useState<InventoryItem[]>(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.ITEM_MASTER);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [
      { id: "1001", sku: "ITEM1001", name: "Laptop Dell XPS 15", category: "Electronics", systemQuantity: 0, physicalQuantity: 0, location: "Warehouse A" },
      { id: "1001", sku: "ITEM1001", name: "Laptop Dell XPS 15", category: "Electronics", systemQuantity: 0, physicalQuantity: 0, location: "Warehouse B" },
      { id: "1002", sku: "ITEM1002", name: "Ergonomic Office Chair", category: "Furniture", systemQuantity: 0, physicalQuantity: 0, location: "Warehouse B" },
      { id: "1003", sku: "ITEM1003", name: "Wireless Keyboard", category: "Electronics", systemQuantity: 0, physicalQuantity: 0, location: "Warehouse A" },
      { id: "1004", sku: "ITEM1004", name: "LED Monitor 27\"", category: "Electronics", systemQuantity: 0, physicalQuantity: 0, location: "Warehouse A" },
      { id: "1005", sku: "ITEM1005", name: "Standing Desk", category: "Furniture", systemQuantity: 0, physicalQuantity: 0, location: "Warehouse C" }
    ];
  });
  
  const [closingStock, setClosingStock] = useState<InventoryItem[]>(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.CLOSING_STOCK);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [];
  });

  const [auditedItems, setAuditedItems] = useState<InventoryItem[]>(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.AUDITED_ITEMS);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [];
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ITEM_MASTER, JSON.stringify(itemMaster));
  }, [itemMaster]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CLOSING_STOCK, JSON.stringify(closingStock));
    
    // Update the item master system quantities when closing stock changes
    if (closingStock.length > 0) {
      const updatedItemMaster = [...itemMaster];
      
      // Process each closing stock item
      closingStock.forEach(stockItem => {
        const itemIndex = updatedItemMaster.findIndex(
          item => item.id === stockItem.id && item.location === stockItem.location
        );
        
        if (itemIndex >= 0) {
          // Update existing item
          updatedItemMaster[itemIndex] = {
            ...updatedItemMaster[itemIndex],
            systemQuantity: stockItem.systemQuantity
          };
        } else {
          // Add new item if it doesn't exist in item master
          updatedItemMaster.push({
            ...stockItem,
            category: stockItem.category || "Unknown",
            name: stockItem.name || `Item ${stockItem.id}`
          });
        }
      });
      
      setItemMaster(updatedItemMaster);
    }
  }, [closingStock]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUDITED_ITEMS, JSON.stringify(auditedItems));
  }, [auditedItems]);

  const scanItem = (barcode: string, location: string) => {
    const scannedItem = itemMaster.find(
      item => (item.sku === barcode || item.id === barcode) && item.location === location
    );
    
    if (scannedItem) {
      const now = new Date().toISOString();
      const existingIndex = auditedItems.findIndex(i => 
        i.id === scannedItem.id && i.location === scannedItem.location
      );
      
      if (existingIndex >= 0) {
        // Update existing audit
        const updatedAuditItems = [...auditedItems];
        const newQuantity = updatedAuditItems[existingIndex].physicalQuantity + 1;
        const newStatus: "matched" | "discrepancy" = 
          newQuantity === updatedAuditItems[existingIndex].systemQuantity ? "matched" : "discrepancy";
        
        updatedAuditItems[existingIndex] = {
          ...updatedAuditItems[existingIndex],
          physicalQuantity: newQuantity,
          lastAudited: now,
          status: newStatus
        };
        setAuditedItems(updatedAuditItems);
      } else {
        // Add new audit
        const status: "matched" | "discrepancy" = 
          1 === scannedItem.systemQuantity ? "matched" : "discrepancy";
        
        const auditedItem: InventoryItem = {
          ...scannedItem,
          physicalQuantity: 1,
          lastAudited: now,
          status: status
        };
        setAuditedItems(prev => [...prev, auditedItem]);
      }
    }
  };

  const searchItem = (query: string): InventoryItem[] => {
    if (!query || query.length < 2) return [];

    return itemMaster.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) || 
      item.sku.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase())
    );
  };

  const addItemToAudit = (item: InventoryItem, quantity: number) => {
    const now = new Date().toISOString();
    const existingIndex = auditedItems.findIndex(i => 
      i.id === item.id && i.location === item.location
    );
    
    if (existingIndex >= 0) {
      // Update existing item
      const updatedItems = [...auditedItems];
      const status: "matched" | "discrepancy" = 
        quantity === item.systemQuantity ? "matched" : "discrepancy";
      
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        physicalQuantity: quantity,
        lastAudited: now,
        status: status
      };
      setAuditedItems(updatedItems);
    } else {
      // Add new item
      const status: "matched" | "discrepancy" = 
        quantity === item.systemQuantity ? "matched" : "discrepancy";
      
      const newItem: InventoryItem = {
        ...item,
        physicalQuantity: quantity,
        lastAudited: now,
        status: status
      };
      setAuditedItems(prev => [...prev, newItem]);
    }
  };

  const getInventorySummary = (): InventorySummary => {
    const totalItems = itemMaster.length;
    const auditedCount = auditedItems.length;
    const pendingItems = totalItems - auditedCount;
    
    const matched = auditedItems.filter(item => item.status === "matched").length;
    const discrepancies = auditedItems.filter(item => item.status === "discrepancy").length;
    
    return {
      totalItems,
      auditedItems: auditedCount,
      pendingItems,
      matched,
      discrepancies
    };
  };

  return (
    <InventoryContext.Provider
      value={{
        itemMaster,
        setItemMaster,
        closingStock,
        setClosingStock,
        auditedItems,
        setAuditedItems,
        scanItem,
        searchItem,
        addItemToAudit,
        getInventorySummary
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
