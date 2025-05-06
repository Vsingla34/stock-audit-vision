
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUserAccess } from "@/hooks/useUserAccess";
import { QuestionList } from "@/components/questionnaire/QuestionList";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import { QuestionnaireResponses } from "@/components/questionnaire/QuestionnaireResponses";
import { LocationSelector } from "@/components/upload/LocationSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventory } from "@/context/InventoryContext";

const Questionnaire = () => {
  const { userRole, accessibleLocations } = useUserAccess();
  const { locations } = useInventory();
  
  const [activeTab, setActiveTab] = useState("management");
  const [selectedLocation, setSelectedLocation] = useState("default");
  const [responseLocation, setResponseLocation] = useState("default");
  
  const userLocations = accessibleLocations();
  
  // Set initial location if user has restricted access
  useEffect(() => {
    if (userRole !== "admin" && userLocations.length > 0) {
      setSelectedLocation(userLocations[0].id);
    }
  }, [userRole, userLocations]);
  
  const locationName = selectedLocation && selectedLocation !== "default" 
    ? locations.find(loc => loc.id === selectedLocation)?.name
    : "";

  const responseLocationName = responseLocation && responseLocation !== "default" 
    ? locations.find(loc => loc.id === responseLocation)?.name
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
                  {userLocations.length > 0 && (
                    <LocationSelector
                      locations={userLocations}
                      selectedLocation={selectedLocation}
                      onLocationChange={setSelectedLocation}
                    />
                  )}
                </div>
                
                {selectedLocation && selectedLocation !== "default" ? (
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
            <div className="space-y-6">
              <div className="max-w-md">
                <LocationSelector
                  locations={userRole === "admin" ? locations : userLocations}
                  selectedLocation={responseLocation}
                  onLocationChange={setResponseLocation}
                />
              </div>
              
              {responseLocation && responseLocation !== "default" ? (
                <QuestionnaireResponses 
                  locationId={responseLocation}
                  locationName={responseLocationName || ""}
                />
              ) : (
                <p className="text-muted-foreground">Please select a location to view responses</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Questionnaire;
