
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface QuestionnaireResponsesProps {
  locationId: string;
  locationName: string;
}

export const QuestionnaireResponses = ({ locationId, locationName }: QuestionnaireResponsesProps) => {
  const { questions, questionnaireAnswers, getQuestionById } = useInventory();
  
  const generatePDF = () => {
    try {
      const locationAnswers = questionnaireAnswers.filter(answer => answer.locationId === locationId);
      
      if (locationAnswers.length === 0) {
        toast.error("No responses available for this location");
        return;
      }
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Audit Questionnaire Responses: ${locationName}`, 14, 22);
      
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
      
      doc.save(`questionnaire-responses-${locationName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };
  
  const filteredAnswers = questionnaireAnswers.filter(answer => answer.locationId === locationId);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Questionnaire Responses for {locationName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {filteredAnswers.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={generatePDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
            
            <div className="space-y-6">
              {questions.map((question) => {
                const answer = filteredAnswers.find(a => a.questionId === question.id);
                
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
      </CardContent>
    </Card>
  );
};
