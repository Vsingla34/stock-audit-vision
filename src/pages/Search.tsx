
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchInventory } from "@/components/search/SearchInventory";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Search = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Inventory</h1>
          <p className="text-muted-foreground">Find and audit items manually</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <SearchInventory />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;
