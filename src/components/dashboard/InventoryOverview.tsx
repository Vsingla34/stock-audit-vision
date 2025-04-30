
import { useInventory } from "@/context/InventoryContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart, FileText, CheckCheck, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const InventoryOverview = () => {
  const { getInventorySummary } = useInventory();
  const summary = getInventorySummary();
  const completionPercentage = summary.totalItems > 0 
    ? Math.round((summary.auditedItems / summary.totalItems) * 100) 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Inventory Items"
        value={summary.totalItems}
        description="Total items in inventory"
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Audit Progress"
        value={`${completionPercentage}%`}
        description={`${summary.auditedItems} of ${summary.totalItems} items audited`}
        icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
      >
      </StatCard>
      <StatCard
        title="Matched Items"
        value={summary.matched}
        description="Items with matching quantities"
        icon={<CheckCheck className="h-4 w-4 text-green-500" />}
        valueClassName="text-green-600"
      />
      <StatCard
        title="Discrepancies"
        value={summary.discrepancies}
        description="Items with quantity discrepancies"
        icon={<AlertCircle className="h-4 w-4 text-red-500" />}
        valueClassName="text-red-600"
      />
      <Card className="md:col-span-2 lg:col-span-4 p-4">
        <h3 className="text-lg font-medium mb-2">Audit Progress</h3>
        <Progress value={completionPercentage} className="h-2" />
        <div className="flex justify-between mt-1 text-sm text-muted-foreground">
          <span>{summary.auditedItems} audited</span>
          <span>{summary.pendingItems} pending</span>
        </div>
      </Card>
    </div>
  );
};
