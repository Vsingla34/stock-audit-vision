
import { useState } from "react";
import { useInventory, InventoryItem } from "@/context/InventoryContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export const SearchInventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const { searchItem, addItemToAudit } = useInventory();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.length >= 2) {
      const results = searchItem(searchQuery);
      setSearchResults(results);
      
      // Initialize quantities for new search results
      const newQuantities: Record<string, number> = {};
      results.forEach(item => {
        newQuantities[item.id] = quantities[item.id] || 0;
      });
      setQuantities(newQuantities);
    }
  };

  const incrementQuantity = (itemId: string) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const decrementQuantity = (itemId: string) => {
    if (quantities[itemId] > 0) {
      setQuantities(prev => ({
        ...prev,
        [itemId]: prev[itemId] - 1
      }));
    }
  };

  const handleAddToAudit = (item: InventoryItem) => {
    const quantity = quantities[item.id] || 0;
    addItemToAudit(item, quantity);
    toast.success("Item added to audit", {
      description: `Added ${quantity} of ${item.name}`
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          <span>Search Inventory</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or ID..."
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>

        {searchResults.length > 0 ? (
          <div className="border rounded-md">
            <div className="grid grid-cols-[1fr_auto] gap-4 p-4 font-medium border-b">
              <div>Item Details</div>
              <div className="text-right">Quantity</div>
            </div>
            {searchResults.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 p-4 border-b last:border-0">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                  <div className="text-sm text-muted-foreground">Location: {item.location}</div>
                  <div className="text-sm">System Quantity: {item.systemQuantity}</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-2 mb-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => decrementQuantity(item.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {quantities[item.id] || 0}
                    </span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => incrementQuantity(item.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddToAudit(item)}
                    disabled={!(quantities[item.id] > 0)}
                  >
                    Add to Audit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.length >= 2 ? (
          <div className="text-center p-8 text-muted-foreground">
            No results found for "{searchQuery}"
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            Enter at least 2 characters to search
          </div>
        )}
      </CardContent>
    </Card>
  );
};
