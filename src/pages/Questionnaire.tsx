
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUserAccess } from "@/hooks/useUserAccess";
import { QuestionList } from "@/components/questionnaire/QuestionList";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import { NoPermissionCard } from "@/components/upload/NoPermissionCard";
import { LocationSelector } from "@/components/upload/LocationSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventory } from "@/context/InventoryContext";

const Questionnaire = () => {
  const { userRole, accessibleLocations, canUploadData } = useUserAccess();
  const { locations } = useInventory();
  const [activeTab, setActiveTab] = useState("management");
  const [selectedLocation, setSelectedLocation] = useState("");
  const userLocations = accessibleLocations();
  
  // Set initial location if user has restricted access
  useEffect(() => {
    if (userRole !== "admin" && userLocations.length > 0) {
      setSelectedLocation(userLocations[0].id);
    }
  }, [userRole, userLocations]);
  
  const locationName = selectedLocation 
    ? locations.find(loc => loc.id === selectedLocation)?.name
    : "";
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Questionnaire</h1>
          <p className="text-muted-foreground">
            Manage audit questionnaires and collect responses from different locations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="management">
              {userRole === "admin" ? "Manage Questions" : "Answer Questions"}
            </TabsTrigger>
            <TabsTrigger value="responses" disabled={!userRole || userRole === "client"}>
              View Responses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="management" className="space-y-6 mt-6">
            {userRole === "admin" ? (
              <QuestionList />
            ) : (
              <div className="space-y-6">
                <div className="max-w-md">
                  <LocationSelector
                    locations={userLocations}
                    selectedLocation={selectedLocation}
                    onLocationChange={setSelectedLocation}
                  />
                </div>
                
                {selectedLocation ? (
                  <QuestionnaireForm 
                    locationId={selectedLocation} 
                    locationName={locationName}
                  />
                ) : (
                  <p className="text-muted-foreground">Please select a location to view and answer questions</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="responses" className="space-y-6 mt-6">
            <div className="bg-muted/20 p-6 rounded-lg text-center">
              <p>Questionnaire responses feature coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Questionnaire;
