
import { InventoryItem, Location, Question, QuestionnaireAnswer } from "@/context/InventoryContext";

const LOCAL_STORAGE_KEYS = {
  ITEM_MASTER: 'inventory-app-item-master',
  CLOSING_STOCK: 'inventory-app-closing-stock',
  AUDITED_ITEMS: 'inventory-app-audited-items',
  LOCATIONS: 'inventory-app-locations',
  QUESTIONS: 'inventory-app-questions',
  QUESTIONNAIRE_ANSWERS: 'inventory-app-questionnaire-answers'
};

class DataPersistenceService {
  // Item Master Methods
  public setItemMaster(items: InventoryItem[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ITEM_MASTER, JSON.stringify(items));
  }

  public getItemMaster(): InventoryItem[] {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.ITEM_MASTER);
    return savedData ? JSON.parse(savedData) : [];
  }

  // Closing Stock Methods
  public setClosingStock(items: InventoryItem[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CLOSING_STOCK, JSON.stringify(items));
  }

  public getClosingStock(): InventoryItem[] {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.CLOSING_STOCK);
    return savedData ? JSON.parse(savedData) : [];
  }

  // Audited Items Methods
  public setAuditedItems(items: InventoryItem[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUDITED_ITEMS, JSON.stringify(items));
  }

  public getAuditedItems(): InventoryItem[] {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.AUDITED_ITEMS);
    return savedData ? JSON.parse(savedData) : [];
  }

  // Location Methods
  public updateLocation(location: Location): void {
    const locations = this.getLocations();
    const index = locations.findIndex(l => l.id === location.id);
    
    if (index >= 0) {
      locations[index] = location;
    } else {
      locations.push(location);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  }

  public getLocations(): Location[] {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.LOCATIONS);
    return savedData ? JSON.parse(savedData) : [];
  }

  public deleteLocation(locationId: string): void {
    const locations = this.getLocations();
    const filteredLocations = locations.filter(location => location.id !== locationId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LOCATIONS, JSON.stringify(filteredLocations));
  }

  // Question Methods
  public setQuestions(questions: Question[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  public getQuestions(): Question[] {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.QUESTIONS);
    return savedData ? JSON.parse(savedData) : [];
  }

  // Questionnaire Answer Methods
  public setQuestionnaireAnswers(answers: QuestionnaireAnswer[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.QUESTIONNAIRE_ANSWERS, JSON.stringify(answers));
  }

  public getQuestionnaireAnswers(): QuestionnaireAnswer[] {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.QUESTIONNAIRE_ANSWERS);
    return savedData ? JSON.parse(savedData) : [];
  }

  // Clear all data
  public clearInventoryData(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ITEM_MASTER);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CLOSING_STOCK);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUDITED_ITEMS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.QUESTIONNAIRE_ANSWERS);
    // Note: We don't clear locations
  }
}

export default new DataPersistenceService();
