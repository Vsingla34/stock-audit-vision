
import { useEffect, useState } from "react";
import { Question, QuestionnaireAnswer, useInventory } from "@/context/InventoryContext";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ClipboardList, Save } from "lucide-react";
import { QuestionRenderer } from "./QuestionRenderer";

interface QuestionnaireFormProps {
  locationId: string;
  locationName?: string;
  onComplete?: () => void;
}

interface AnswerState {
  [questionId: string]: string | string[];
}

export const QuestionnaireForm = ({ locationId, locationName, onComplete }: QuestionnaireFormProps) => {
  const { questions, getLocationQuestionnaireAnswers, saveQuestionnaireAnswer } = useInventory();
  const { currentUser } = useUser();
  
  const [answers, setAnswers] = useState<AnswerState>({});
  const [showErrors, setShowErrors] = useState(false);

  // Fetch existing answers for this location
  useEffect(() => {
    if (locationId) {
      const locationAnswers = getLocationQuestionnaireAnswers(locationId);
      
      // Initialize answers state with existing answers
      const initialAnswers: AnswerState = {};
      locationAnswers.forEach(answer => {
        initialAnswers[answer.questionId] = answer.answer;
      });
      
      setAnswers(initialAnswers);
    }
  }, [locationId, getLocationQuestionnaireAnswers]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isQuestionAnswered = (question: Question): boolean => {
    const answer = answers[question.id];
    
    if (answer === undefined) return false;
    
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    
    return answer.trim() !== "";
  };

  const getRequiredQuestionsUnanswered = (): Question[] => {
    return questions.filter(q => q.required && !isQuestionAnswered(q));
  };

  const handleSubmit = () => {
    const unansweredRequiredQuestions = getRequiredQuestionsUnanswered();
    
    if (unansweredRequiredQuestions.length > 0) {
      setShowErrors(true);
      toast.error(`Please answer all required questions (${unansweredRequiredQuestions.length} remaining)`);
      return;
    }
    
    // Save all answers
    questions.forEach(question => {
      const answer = answers[question.id];
      
      if (answer !== undefined) {
        saveQuestionnaireAnswer({
          questionId: question.id,
          locationId,
          answer,
          answeredBy: currentUser?.username
        });
      }
    });
    
    toast.success("Questionnaire saved successfully");
    
    if (onComplete) {
      onComplete();
    }
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-1">
            <p>No questions have been created for this audit.</p>
            <p className="text-sm text-muted-foreground">
              Ask an administrator to add questions to the questionnaire.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardList className="h-5 w-5 mr-2" />
          Audit Questionnaire {locationName && `for ${locationName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {questions.map((question) => {
            const isError = showErrors && question.required && !isQuestionAnswered(question);
            
            return (
              <div key={question.id} className={`space-y-2 ${isError ? 'p-2 border border-red-200 rounded-md bg-red-50' : ''}`}>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{question.text}</span>
                  {question.required && <span className="text-red-500">*</span>}
                </div>
                
                <QuestionRenderer 
                  question={question}
                  answer={answers[question.id] || (question.type === "multiSelect" ? [] : "")}
                  isError={isError}
                  onChange={handleAnswerChange}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="border-t p-6">
        <Button onClick={handleSubmit} className="ml-auto">
          <Save className="h-4 w-4 mr-2" />
          Save Answers
        </Button>
      </CardFooter>
    </Card>
  );
};
