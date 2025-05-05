
import { useEffect, useState } from "react";
import { 
  Question, 
  QuestionnaireAnswer, 
  useInventory 
} from "@/context/InventoryContext";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ClipboardList, Save, AlertCircle } from "lucide-react";

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

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSingleSelectChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultiSelectChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = (prev[questionId] as string[]) || [];
      
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, value]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(v => v !== value)
        };
      }
    });
  };

  const handleYesNoChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isQuestionAnswered = (question: Question): boolean => {
    const answer = answers[question.id];
    
    if (!answer) return false;
    
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
                
                {isError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    This question requires an answer
                  </div>
                )}
                
                <div className="pt-1">
                  {question.type === "text" && (
                    <Textarea
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => handleTextChange(question.id, e.target.value)}
                      placeholder="Enter your answer..."
                      className={isError ? "border-red-500" : ""}
                    />
                  )}
                  
                  {question.type === "singleSelect" && question.options && (
                    <RadioGroup
                      value={(answers[question.id] as string) || ""}
                      onValueChange={(value) => handleSingleSelectChange(question.id, value)}
                      className="space-y-2"
                    >
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
                          <Label htmlFor={`${question.id}-${option.id}`}>{option.text}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  {question.type === "multiSelect" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const isChecked = Array.isArray(answers[question.id]) && 
                          (answers[question.id] as string[]).includes(option.id);
                        
                        return (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${question.id}-${option.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => 
                                handleMultiSelectChange(question.id, option.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={`${question.id}-${option.id}`}>{option.text}</Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {question.type === "yesNo" && (
                    <RadioGroup
                      value={(answers[question.id] as string) || ""}
                      onValueChange={(value) => handleYesNoChange(question.id, value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                        <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`${question.id}-no`} />
                        <Label htmlFor={`${question.id}-no`}>No</Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>
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
