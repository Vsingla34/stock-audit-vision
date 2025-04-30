
import { AppLayout } from "@/components/layout/AppLayout";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, Cell, Bar, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

const Analytics = () => {
  const { auditedItems, itemMaster, getInventorySummary } = useInventory();
  const summary = getInventorySummary();

  // Calculate category-based audit data
  const getCategoryData = () => {
    const categories: Record<string, { name: string, total: number, audited: number }> = {};
    
    itemMaster.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = {
          name: item.category,
          total: 0,
          audited: 0
        };
      }
      categories[item.category].total += 1;
    });
    
    auditedItems.forEach(item => {
      if (categories[item.category]) {
        categories[item.category].audited += 1;
      }
    });
    
    return Object.values(categories);
  };

  // Data for status pie chart
  const statusData = [
    { name: "Matched", value: summary.matched, color: "#22c55e" },
    { name: "Discrepancies", value: summary.discrepancies, color: "#ef4444" },
    { name: "Pending", value: summary.pendingItems, color: "#94a3b8" },
  ];

  // Data for location-based bar chart
  const getLocationData = () => {
    const locations: Record<string, { name: string, system: number, physical: number }> = {};
    
    itemMaster.forEach(item => {
      if (!locations[item.location]) {
        locations[item.location] = {
          name: item.location,
          system: 0,
          physical: 0
        };
      }
      locations[item.location].system += item.systemQuantity;
    });
    
    auditedItems.forEach(item => {
      if (locations[item.location]) {
        locations[item.location].physical += item.physicalQuantity;
      }
    });
    
    return Object.values(locations);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Visual insights into your inventory audit</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Audit Status</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Audit Progress</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getCategoryData()}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Items" fill="#94a3b8" />
                  <Bar dataKey="audited" name="Audited" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Inventory by Location</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getLocationData()}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="system" name="System Quantity" fill="#8884d8" />
                  <Bar dataKey="physical" name="Physical Quantity" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analytics;
