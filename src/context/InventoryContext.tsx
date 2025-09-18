
import React, { createContext, useContext, useState, useEffect } from "react";
import SupabaseDataService from "@/services/SupabaseDataService";

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
  description?: string;
  active?: boolean;
}

export type QuestionType = 'text' | 'singleSelect' | 'multiSelect' | 'yesNo';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];
}

export interface QuestionnaireAnswer {
  questionId: string;
  locationId: string;
  answer: string | string[];
  answeredBy?: string;
  answeredOn: string;
}

// Define the context interface
interface InventoryContextType {
  itemMaster: InventoryItem[];
  closingStock: InventoryItem[];
  auditedItems: InventoryItem[];
  locations: Location[];
  questions: Question[];
  questionnaireAnswers: QuestionnaireAnswer[];
  setItemMaster: (items: InventoryItem[]) => void;
  setClosingStock: (items: InventoryItem[]) => void;
  updateAuditedItem: (item: InventoryItem) => Promise<void>;
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
  addLocation: (location: Omit<Location, 'id'>) => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
  scanItem: (barcode: string, location: string) => void;
  searchItem: (query: string) => InventoryItem[];
  addItemToAudit: (item: InventoryItem, quantity: number) => void;
  addQuestion: (question: Omit<Question, 'id'>) => Promise<void>;
  updateQuestion: (question: Question) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  saveQuestionnaireAnswer: (answer: Omit<QuestionnaireAnswer, 'answeredOn'>) => Promise<void>;
  getLocationQuestionnaireAnswers: (locationId: string) => QuestionnaireAnswer[];
  getQuestionsForLocation: (locationId: string) => Question[];
  getQuestionById: (questionId: string) => Question | undefined;
}

// Create the context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Provider component
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itemMaster, setItemMasterState] = useState<InventoryItem[]>([]);
  const [closingStock, setClosingStockState] = useState<InventoryItem[]>([]);
  const [auditedItems, setAuditedItemsState] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswer[]>([]);
  
  // Load data from persistence service on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setItemMasterState(await SupabaseDataService.getItemMaster());
        setClosingStockState(await SupabaseDataService.getClosingStock());
        setAuditedItemsState(await SupabaseDataService.getAuditedItems());
        setLocations(await SupabaseDataService.getLocations());
        setQuestions(await SupabaseDataService.getQuestions() || []);
        setQuestionnaireAnswers(await SupabaseDataService.getQuestionnaireAnswers() || []);
      } catch (error) {
        console.error("Error loading inventory data:", error);
      }
    };
    
    loadData();
  }, []);
  
  // Set item master with persistence
  const setItemMaster = async (items: InventoryItem[]) => {
    setItemMasterState(items);
    await SupabaseDataService.setItemMaster(items);
  };
  
  // Set closing stock with persistence
  const setClosingStock = async (items: InventoryItem[]) => {
    setClosingStockState(items);
    await SupabaseDataService.setClosingStock(items);
  };
  
  // Update a single audited item
  const updateAuditedItem = async (item: InventoryItem) => {
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
    await SupabaseDataService.setAuditedItems(newAuditedItems);
  };
  
  // Add a new location
  const addLocation = async (location: Omit<Location, 'id'>) => {
    const id = `loc${Date.now()}`;
    const newLocation: Location = {
      id,
      name: location.name,
      description: location.description,
      active: location.active !== undefined ? location.active : true
    };
    
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    await SupabaseDataService.updateLocation(newLocation);
  };
  
  // Update an existing location
  const updateLocation = async (location: Location) => {
    const updatedLocations = locations.map(loc => 
      loc.id === location.id ? location : loc
    );
    
    setLocations(updatedLocations);
    await SupabaseDataService.updateLocation(location);
  };
  
  // Delete a location
  const deleteLocation = async (locationId: string) => {
    // Check if the location is being used by any items
    const itemsInLocation = itemMaster.some(item => {
      const loc = locations.find(l => l.id === locationId);
      return loc && item.location === loc.name;
    });
    
    if (itemsInLocation) {
      throw new Error("Cannot delete location that contains inventory items");
    }
    
    const updatedLocations = locations.filter(loc => loc.id !== locationId);
    setLocations(updatedLocations);
    await SupabaseDataService.deleteLocation(locationId);
  };
  
  // Scan an item by barcode
  const scanItem = (barcode: string, location: string) => {
    // Find item in master data
    const item = itemMaster.find(i => 
      (i.id === barcode || i.sku === barcode) && i.location === location
    );
    
    if (!item) {
      throw new Error(`Item with barcode ${barcode} not found at location ${location}`);
    }
    
    // Update the audited item
    updateAuditedItem({
      ...item,
      physicalQuantity: (item.physicalQuantity || 0) + 1,
      status: 'pending'
    });
  };
  
  // Search for items
  const searchItem = (query: string): InventoryItem[] => {
    if (!query || query.length < 2) return [];
    
    const lowerCaseQuery = query.toLowerCase();
    return itemMaster.filter(item => 
      item.id?.toLowerCase().includes(lowerCaseQuery) ||
      item.sku?.toLowerCase().includes(lowerCaseQuery) ||
      item.name?.toLowerCase().includes(lowerCaseQuery) ||
      item.category?.toLowerCase().includes(lowerCaseQuery)
    );
  };
  
  // Add an item to the audit with specified quantity
  const addItemToAudit = (item: InventoryItem, quantity: number) => {
    if (quantity <= 0) return;
    
    updateAuditedItem({
      ...item,
      physicalQuantity: quantity,
      status: quantity === item.systemQuantity ? 'matched' : 'discrepancy',
      lastAudited: new Date().toISOString()
    });
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
  
  // Add a new question
  const addQuestion = async (question: Omit<Question, 'id'>) => {
    const id = `q${Date.now()}`;
    const newQuestion: Question = {
      id,
      ...question
    };
    
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    await SupabaseDataService.setQuestions(updatedQuestions);
  };
  
  // Update an existing question
  const updateQuestion = async (question: Question) => {
    const updatedQuestions = questions.map(q => 
      q.id === question.id ? question : q
    );
    
    setQuestions(updatedQuestions);
    await SupabaseDataService.setQuestions(updatedQuestions);
  };
  
  // Delete a question
  const deleteQuestion = async (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    await SupabaseDataService.setQuestions(updatedQuestions);
    
    // Also remove any answers to this question
    const updatedAnswers = questionnaireAnswers.filter(a => a.questionId !== questionId);
    setQuestionnaireAnswers(updatedAnswers);
    await SupabaseDataService.setQuestionnaireAnswers(updatedAnswers);
  };
  
  // Save a questionnaire answer
  const saveQuestionnaireAnswer = async (answer: Omit<QuestionnaireAnswer, 'answeredOn'>) => {
    const newAnswer: QuestionnaireAnswer = {
      ...answer,
      answeredOn: new Date().toISOString()
    };
    
    // Check if we're updating an existing answer
    const existingIndex = questionnaireAnswers.findIndex(
      a => a.questionId === answer.questionId && a.locationId === answer.locationId
    );
    
    let updatedAnswers: QuestionnaireAnswer[];
    
    if (existingIndex >= 0) {
      updatedAnswers = [...questionnaireAnswers];
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers = [...questionnaireAnswers, newAnswer];
    }
    
    setQuestionnaireAnswers(updatedAnswers);
    await SupabaseDataService.setQuestionnaireAnswers(updatedAnswers);
  };
  
  // Get all answers for a specific location
  const getLocationQuestionnaireAnswers = (locationId: string): QuestionnaireAnswer[] => {
    return questionnaireAnswers.filter(answer => answer.locationId === locationId);
  };
  
  // Get all questions that have been answered for a location and those that haven't
  const getQuestionsForLocation = (locationId: string): Question[] => {
    return questions;
  };
  
  // Get a question by its ID
  const getQuestionById = (questionId: string): Question | undefined => {
    return questions.find(q => q.id === questionId);
  };
  
  // Clear all data
  const clearAllData = async () => {
    setItemMasterState([]);
    setClosingStockState([]);
    setAuditedItemsState([]);
    setQuestions([]);
    setQuestionnaireAnswers([]);
    await SupabaseDataService.clearInventoryData();
  };
  
  return (
    <InventoryContext.Provider
      value={{
        itemMaster,
        closingStock,
        auditedItems,
        locations,
        questions,
        questionnaireAnswers,
        setItemMaster,
        setClosingStock,
        updateAuditedItem,
        getInventorySummary,
        getLocationSummary,
        clearAllData,
        addLocation,
        updateLocation,
        deleteLocation,
        scanItem,
        searchItem,
        addItemToAudit,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        saveQuestionnaireAnswer,
        getLocationQuestionnaireAnswers,
        getQuestionsForLocation,
        getQuestionById
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
