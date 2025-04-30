
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export const ExampleData = () => {
  const itemMasterTemplate = 
`id,sku,name,category,location,unitCost
1001,ITEM1001,Laptop Dell XPS 15,Electronics,Warehouse A,1299.99
1002,ITEM1002,Ergonomic Office Chair,Furniture,Warehouse B,249.99
1003,ITEM1003,Wireless Keyboard,Electronics,Warehouse A,59.99
1004,ITEM1004,LED Monitor 27",Electronics,Warehouse A,299.99
1005,ITEM1005,Standing Desk,Furniture,Warehouse C,399.99`;

  const closingStockTemplate = 
`id,sku,systemQuantity,location
1001,ITEM1001,25,Warehouse A
1002,ITEM1002,15,Warehouse B
1003,ITEM1003,50,Warehouse A
1004,ITEM1004,30,Warehouse A
1005,ITEM1005,10,Warehouse C`;

  const downloadTemplate = (data: string, filename: string) => {
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success(`${filename} downloaded`, {
      description: "Sample template has been downloaded"
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sample Item Master Template
          </CardTitle>
          <CardDescription>
            Download a sample CSV template for your Item Master data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Required columns: id, sku, name, category, location (quantity should only be in closing stock)
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => downloadTemplate(itemMasterTemplate, "item_master_template.csv")}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sample Closing Stock Template
          </CardTitle>
          <CardDescription>
            Download a sample CSV template for your Closing Stock data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Required columns: id, sku, systemQuantity, location
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => downloadTemplate(closingStockTemplate, "closing_stock_template.csv")}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
