import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, Location, Question, QuestionnaireAnswer } from "@/context/InventoryContext";

class SupabaseDataService {
  // Helper function to convert database inventory item to app format
  private dbToInventoryItem(dbItem: any): InventoryItem {
    return {
      id: dbItem.id,
      sku: dbItem.sku,
      name: dbItem.name,
      location: dbItem.location,
      systemQuantity: dbItem.system_quantity,
      physicalQuantity: dbItem.physical_quantity,
      status: dbItem.status as 'pending' | 'matched' | 'discrepancy',
      lastAudited: dbItem.last_audited,
      notes: dbItem.notes,
    };
  }

  // Helper function to convert app inventory item to database format
  private inventoryItemToDb(item: InventoryItem): any {
    // Do NOT send custom string IDs to the database. Let Postgres generate UUIDs.
    return {
      sku: item.sku,
      name: item.name,
      location: item.location,
      system_quantity: item.systemQuantity,
      physical_quantity: item.physicalQuantity,
      status: item.status || 'pending',
      last_audited: item.lastAudited,
      notes: item.notes,
    };
  }

  // Item Master Methods
  public async setItemMaster(items: InventoryItem[]): Promise<void> {
    try {
      // First, clear existing item master data (items with system_quantity > 0)
      await supabase
        .from('inventory_items')
        .delete()
        .gt('system_quantity', 0);

      // Insert new items
      if (items.length > 0) {
        const dbItems = items.map(item => this.inventoryItemToDb(item));
        const { error } = await supabase
          .from('inventory_items')
          .insert(dbItems);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error setting item master:', error);
      throw error;
    }
  }

  public async getItemMaster(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('system_quantity', 0);
      
      if (error) throw error;
      
      return data?.map(item => this.dbToInventoryItem(item)) || [];
    } catch (error) {
      console.error('Error getting item master:', error);
      return [];
    }
  }

  // Closing Stock Methods
  public async setClosingStock(items: InventoryItem[]): Promise<void> {
    try {
      // Upsert items (insert or update existing ones)
      if (items.length > 0) {
        const dbItems = items.map(item => this.inventoryItemToDb(item));
        const { error } = await supabase
          .from('inventory_items')
          .upsert(dbItems, { onConflict: 'sku,location' });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error setting closing stock:', error);
      throw error;
    }
  }

  public async getClosingStock(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .not('physical_quantity', 'is', null);
      
      if (error) throw error;
      
      return data?.map(item => this.dbToInventoryItem(item)) || [];
    } catch (error) {
      console.error('Error getting closing stock:', error);
      return [];
    }
  }

  // Audited Items Methods
  public async setAuditedItems(items: InventoryItem[]): Promise<void> {
    try {
      if (items.length > 0) {
        const dbItems = items.map(item => this.inventoryItemToDb(item));
        const { error } = await supabase
          .from('inventory_items')
          .upsert(dbItems, { onConflict: 'sku,location' });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error setting audited items:', error);
      throw error;
    }
  }

  public async getAuditedItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .not('last_audited', 'is', null);
      
      if (error) throw error;
      
      return data?.map(item => this.dbToInventoryItem(item)) || [];
    } catch (error) {
      console.error('Error getting audited items:', error);
      return [];
    }
  }

  // Location Methods
  public async updateLocation(location: Location): Promise<void> {
    try {
      // Only include ID if it's a valid UUID; otherwise let Postgres generate it
      const isValidUuid = (v: string) =>
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

      const upsertData: any = {
        name: location.name,
        description: location.description,
        active: location.active ?? true,
      };

      if (location.id && isValidUuid(location.id)) {
        upsertData.id = location.id;
      }

      const { error } = await supabase
        .from('locations')
        .upsert(upsertData);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  public async getLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data?.map(location => ({
        id: location.id,
        name: location.name,
        description: location.description,
        active: location.active,
      })) || [];
    } catch (error) {
      console.error('Error getting locations:', error);
      return [];
    }
  }

  public async deleteLocation(locationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  // Question Methods
  public async setQuestions(questions: Question[]): Promise<void> {
    try {
      // Clear existing questions
      await supabase.from('questions').delete().gte('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new questions
      if (questions.length > 0) {
        const dbQuestions = questions.map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          required: q.required,
          options: q.options ? JSON.stringify(q.options) : null,
        }));
        
        const { error } = await supabase
          .from('questions')
          .insert(dbQuestions);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error setting questions:', error);
      throw error;
    }
  }

  public async getQuestions(): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('text');
      
      if (error) throw error;
      
      return data?.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type as any,
        required: q.required,
        options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined,
      })) || [];
    } catch (error) {
      console.error('Error getting questions:', error);
      return [];
    }
  }

  // Questionnaire Answer Methods
  public async setQuestionnaireAnswers(answers: QuestionnaireAnswer[]): Promise<void> {
    try {
      if (answers.length > 0) {
        const dbAnswers = answers.map(a => ({
          question_id: a.questionId,
          location_id: a.locationId,
          answer: typeof a.answer === 'string' ? a.answer : JSON.stringify(a.answer),
          answered_by: a.answeredBy,
          answered_on: a.answeredOn,
        }));
        
        const { error } = await supabase
          .from('questionnaire_answers')
          .upsert(dbAnswers, { onConflict: 'question_id,location_id' });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error setting questionnaire answers:', error);
      throw error;
    }
  }

  public async getQuestionnaireAnswers(): Promise<QuestionnaireAnswer[]> {
    try {
      const { data, error } = await supabase
        .from('questionnaire_answers')
        .select('*')
        .order('answered_on', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(a => ({
        questionId: a.question_id,
        locationId: a.location_id,
        answer: a.answer,
        answeredBy: a.answered_by,
        answeredOn: a.answered_on,
      })) || [];
    } catch (error) {
      console.error('Error getting questionnaire answers:', error);
      return [];
    }
  }

  // Clear all inventory data (keep locations and questions)
  public async clearInventoryData(): Promise<void> {
    try {
      await supabase.from('inventory_items').delete().gte('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('questionnaire_answers').delete().gte('id', '00000000-0000-0000-0000-000000000000');
    } catch (error) {
      console.error('Error clearing inventory data:', error);
      throw error;
    }
  }
}

export default new SupabaseDataService();
