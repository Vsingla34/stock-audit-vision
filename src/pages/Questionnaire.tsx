
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUserAccess } from "@/hooks/useUserAccess";
import { QuestionList } from "@/components/questionnaire/QuestionList";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import { NoPermissionCard } from "@/components/upload/NoPermissionCard";
import { LocationSelector } from "@/components/upload/LocationSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Questionnaire = () => {
  const { userRole, accessibleLocations, canUploadData } = useUserAccess();
  const { 
    locations, 
    questions, 
    getLocationQuestionnaireAnswers, 
    getQuestionById,
    questionnaireAnswers 
  } = useInventory();
  
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
  
  const generatePDF = () => {
    if (responseLocation === "default") {
      toast.error("Please select a location");
      return;
    }
    
    try {
      const locationAnswers = getLocationQuestionnaireAnswers(responseLocation);
      
      if (locationAnswers.length === 0) {
        toast.error("No responses available for this location");
        return;
      }
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Audit Questionnaire Responses: ${responseLocationName}`, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      let yPos = 40;
      
      // Add responses
      locationAnswers.forEach((answer, index) => {
        const question = getQuestionById(answer.questionId);
        
        if (!question) return;
        
        // Add question text
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${index + 1}. ${question.text}`, 14, yPos);
        yPos += 8;
        
        // Add answer
        doc.setFont(undefined, 'normal');
        let answerText = '';
        
        if (Array.isArray(answer.answer)) {
          // Handle multiple select answers
          const selectedOptions = question.options?.filter(opt => 
            answer.answer.includes(opt.id)
          ) || [];
          
          answerText = selectedOptions.map(opt => opt.text).join(", ");
        } else {
          // Handle single answer
          if (question.type === "singleSelect") {
            const option = question.options?.find(opt => opt.id === answer.answer);
            answerText = option?.text || answer.answer;
          } else if (question.type === "yesNo") {
            answerText = answer.answer === "yes" ? "Yes" : "No";
          } else {
            answerText = answer.answer;
          }
        }
        
        const lines = doc.splitTextToSize(answerText, 180);
        doc.text(lines, 14, yPos);
        yPos += 6 * lines.length + 10;
        
        // Add answered by and date info
        doc.setFontSize(10);
        doc.setTextColor(100);
        if (answer.answeredBy) {
          doc.text(`Answered by: ${answer.answeredBy} on ${new Date(answer.answeredOn).toLocaleString()}`, 14, yPos);
        } else {
          doc.text(`Answered on ${new Date(answer.answeredOn).toLocaleString()}`, 14, yPos);
        }
        yPos += 15;
        doc.setTextColor(0);
      });
      
      // Add signature section
      doc.addPage();
      doc.setFontSize(12);
      doc.text("Approval Sign-off", 14, 20);
      
      doc.setFontSize(11);
      doc.text("Auditor Signature: _______________________", 14, 40);
      doc.text("Date: _______________________", 14, 50);
      
      doc.text("Client Signature: _______________________", 14, 70);
      doc.text("Date: _______________________", 14, 80);
      
      doc.text("Approved By: _______________________", 14, 100);
      doc.text("Role: _______________________", 14, 110);
      doc.text("Date: _______________________", 14, 120);
      
      doc.save(`questionnaire-responses-${responseLocationName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };
  
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  View Questionnaire Responses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-md">
                  <LocationSelector
                    locations={userRole === "admin" ? locations : userLocations}
                    selectedLocation={responseLocation}
                    onLocationChange={setResponseLocation}
                  />
                </div>
                
                {responseLocation && responseLocation !== "default" ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        Responses for {responseLocationName}
                      </h3>
                      <Button onClick={generatePDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                    
                    {questionnaireAnswers
                      .filter(answer => answer.locationId === responseLocation)
                      .length > 0 ? (
                      <div className="space-y-6">
                        {questions.map((question) => {
                          const answer = questionnaireAnswers.find(
                            a => a.questionId === question.id && a.locationId === responseLocation
                          );
                          
                          if (!answer) return null;
                          
                          return (
                            <div key={question.id} className="border rounded-md p-4 space-y-2 bg-slate-50">
                              <div className="font-medium">{question.text}</div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {question.type === "text" ? "Text response" : 
                                  question.type === "singleSelect" ? "Single choice" :
                                  question.type === "multiSelect" ? "Multiple choice" : "Yes/No question"}
                              </div>
                              
                              <div className="bg-white p-3 rounded border">
                                {question.type === "text" && (
                                  <p>{answer.answer as string}</p>
                                )}
                                
                                {question.type === "singleSelect" && (
                                  <p>{question.options?.find(opt => opt.id === answer.answer)?.text || answer.answer}</p>
                                )}
                                
                                {question.type === "multiSelect" && (
                                  <ul className="list-disc list-inside">
                                    {Array.isArray(answer.answer) && question.options?.filter(
                                      opt => answer.answer.includes(opt.id)
                                    ).map(opt => (
                                      <li key={opt.id}>{opt.text}</li>
                                    ))}
                                  </ul>
                                )}
                                
                                {question.type === "yesNo" && (
                                  <p>{answer.answer === "yes" ? "Yes" : "No"}</p>
                                )}
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                {answer.answeredBy && (
                                  <>Answered by {answer.answeredBy} on </>
                                )}
                                {new Date(answer.answeredOn).toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No responses found</AlertTitle>
                        <AlertDescription>
                          There are no questionnaire responses for this location yet.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Please select a location to view responses</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Questionnaire;
