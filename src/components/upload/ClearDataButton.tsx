
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/context/InventoryContext";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const ClearDataButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setItemMaster, setClosingStock, setAuditedItems } = useInventory();

  const handleClearData = () => {
    setItemMaster([]);
    setClosingStock([]);
    setAuditedItems([]);
    toast.success("All data cleared successfully", {
      description: "Item master, closing stock, and audit data have been reset"
    });
  };

  return (
    <>
      <Button 
        variant="destructive" 
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clear All Data
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all your inventory data including item master,
              closing stock, and audit records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, clear all data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
