
import { AppLayout } from "@/components/layout/AppLayout";
import { LocationMaster } from "@/components/locations/LocationMaster";
import { LocationAuditSummary } from "@/components/locations/LocationAuditSummary";

const LocationManagement = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Location Management</h1>
          <p className="text-muted-foreground">Manage inventory locations and view location-specific audit data</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <LocationMaster />
          </div>
          <div>
            <LocationAuditSummary />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LocationManagement;
