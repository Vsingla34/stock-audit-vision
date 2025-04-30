
import React, { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Barcode, Scan, Check, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const BarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const { scanItem, itemMaster } = useInventory();

  // Get unique locations from item master
  const locations = [...new Set(itemMaster.map(item => item.location))];

  const handleStartScanning = () => {
    if (!selectedLocation) {
      toast.error("Location required", {
        description: "Please select a location before scanning."
      });
      return;
    }
    setIsScanning(true);
    // In a real app, this would activate the device camera
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      toast.error("Location required", {
        description: "Please select a location before scanning."
      });
      return;
    }
    
    if (manualBarcode.trim()) {
      const found = itemMaster.some(item => 
        (item.id === manualBarcode || item.sku === manualBarcode) && 
        item.location === selectedLocation
      );
      
      if (found) {
        scanItem(manualBarcode, selectedLocation);
        toast.success("Item scanned successfully", {
          description: `Barcode ${manualBarcode} has been registered at ${selectedLocation}.`,
        });
        setManualBarcode("");
      } else {
        toast.error("Item not found", {
          description: `No item found with barcode ${manualBarcode} at ${selectedLocation}.`,
        });
      }
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Barcode className="h-5 w-5" />
            <span>Barcode Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isScanning ? (
              <div>
                <div className="w-full aspect-video relative barcode-scanner-active rounded-lg overflow-hidden mb-4">
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center text-muted-foreground">
                      Camera preview would appear here
                    </p>
                    <div className="scanner-line" />
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleStopScanning}
                >
                  Stop Scanning
                </Button>
              </div>
            ) : (
              <Button 
                variant="default" 
                className="w-full" 
                onClick={handleStartScanning}
                disabled={!selectedLocation}
              >
                <Scan className="mr-2 h-4 w-4" />
                Start Camera Scanning
              </Button>
            )}

            <div className="relative mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Or enter barcode manually:</h3>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter barcode/SKU"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!selectedLocation}>
                  <Check className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scanning Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">How to scan items:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Select a location from the dropdown</li>
              <li>Click "Start Camera Scanning" to activate the barcode scanner</li>
              <li>Point the camera at the barcode on the item</li>
              <li>Hold steady until the barcode is recognized</li>
              <li>A confirmation will appear when the scan is successful</li>
            </ol>
          </div>
          <div>
            <h3 className="font-medium mb-1">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Ensure good lighting for better scanning performance</li>
              <li>If scanning fails, try the manual entry option</li>
              <li>For bulk scanning, maintain a consistent distance from barcodes</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Supported barcode formats:</h3>
            <p className="text-sm text-muted-foreground">
              CODE128, CODE39, UPC, EAN, QR Code
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
