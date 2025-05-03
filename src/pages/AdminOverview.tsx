
import { AppLayout } from "@/components/layout/AppLayout";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileChartColumn, Building } from "lucide-react";

const AdminOverview = () => {
  const { locations, getLocationSummary } = useInventory();
  
  // Get summaries for all locations
  const locationSummaries = locations.map(location => ({
    location,
    summary: getLocationSummary(location.name)
  }));

  // Calculate overall stats
  const overallStats = {
    totalItems: locationSummaries.reduce((sum, loc) => sum + loc.summary.totalItems, 0),
    auditedItems: locationSummaries.reduce((sum, loc) => sum + loc.summary.auditedItems, 0),
    matched: locationSummaries.reduce((sum, loc) => sum + loc.summary.matched, 0),
    discrepancies: locationSummaries.reduce((sum, loc) => sum + loc.summary.discrepancies, 0),
  };

  const overallProgress = overallStats.totalItems > 0 
    ? Math.round((overallStats.auditedItems / overallStats.totalItems) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground">Monitor audit progress across all locations</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Across all locations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Audited Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.auditedItems}</div>
              <p className="text-xs text-muted-foreground">{overallProgress}% complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Matched Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overallStats.matched}</div>
              <p className="text-xs text-muted-foreground">
                {overallStats.auditedItems > 0
                  ? Math.round((overallStats.matched / overallStats.auditedItems) * 100)
                  : 0}% match rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overallStats.discrepancies}</div>
              <p className="text-xs text-muted-foreground">
                {overallStats.auditedItems > 0
                  ? Math.round((overallStats.discrepancies / overallStats.auditedItems) * 100)
                  : 0}% with issues
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileChartColumn className="h-5 w-5" />
              <span>Location Audit Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Items</TableHead>
                  <TableHead>Audited</TableHead>
                  <TableHead>Matched</TableHead>
                  <TableHead>Discrepancies</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationSummaries.map(({ location, summary }) => {
                  const progressPercentage = summary.totalItems > 0
                    ? Math.round((summary.auditedItems / summary.totalItems) * 100)
                    : 0;
                  
                  return (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {location.name}
                      </TableCell>
                      <TableCell>{summary.totalItems}</TableCell>
                      <TableCell>{summary.auditedItems}</TableCell>
                      <TableCell className="text-green-600">{summary.matched}</TableCell>
                      <TableCell className="text-red-600">{summary.discrepancies}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progressPercentage} className="h-2 w-full max-w-[100px]" />
                          <span className="text-xs font-medium">{progressPercentage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminOverview;
