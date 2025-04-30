
import { useInventory, InventoryItem } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { format } from "date-fns";

export const RecentActivity = () => {
  const { auditedItems } = useInventory();

  // Get the most recent 5 audited items
  const recentItems = [...auditedItems]
    .sort((a, b) => {
      if (!a.lastAudited || !b.lastAudited) return 0;
      return new Date(b.lastAudited).getTime() - new Date(a.lastAudited).getTime();
    })
    .slice(0, 5);

  if (recentItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No recent audit activity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {recentItems.map((item, index) => (
                <tr key={`${item.id}-${item.location}-${index}`} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="mr-2">
                        {item.status === "matched" ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-4 w-4 text-green-600" />
                          </span>
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                            <X className="h-4 w-4 text-red-600" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.sku} - {item.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-medium">
                      {item.physicalQuantity} / {item.systemQuantity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.lastAudited && format(new Date(item.lastAudited), "dd MMM, HH:mm")}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
