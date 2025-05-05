
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInventory } from "@/context/InventoryContext";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const ClearDataButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { clearAllData } = useInventory();

  const handleClear = () => {
    try {
      clearAllData();
      setDialogOpen(false);
      toast.success("Inventory data cleared successfully");
    } catch (error) {
      toast.error("Failed to clear inventory data");
      console.error("Error clearing data:", error);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        className="w-full" 
        onClick={() => setDialogOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clear All Inventory Data
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Inventory Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all inventory data? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClear}
            >
              Delete All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
