
import { Question, QuestionOption } from "@/context/InventoryContext";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";

interface QuestionRendererProps {
  question: Question;
  answer: string | string[];
  isError: boolean;
  onChange: (questionId: string, value: string | string[]) => void;
}

export const QuestionRenderer = ({ question, answer, isError, onChange }: QuestionRendererProps) => {
  const handleTextChange = (value: string) => {
    onChange(question.id, value);
  };

  const handleSingleSelectChange = (value: string) => {
    onChange(question.id, value);
  };

  const handleMultiSelectChange = (value: string, checked: boolean) => {
    const currentAnswers = (Array.isArray(answer) ? answer : []) as string[];
    
    if (checked) {
      onChange(question.id, [...currentAnswers, value]);
    } else {
      onChange(question.id, currentAnswers.filter(v => v !== value));
    }
  };

  const handleYesNoChange = (value: string) => {
    onChange(question.id, value);
  };

  return (
    <div className="pt-1">
      {isError && (
        <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
          <AlertCircle className="h-4 w-4" />
          This question requires an answer
        </div>
      )}
      
      {question.type === "text" && (
        <Textarea
          value={(answer as string) || ""}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter your answer..."
          className={isError ? "border-red-500" : ""}
        />
      )}
      
      {question.type === "singleSelect" && question.options && (
        <RadioGroup
          value={(answer as string) || ""}
          onValueChange={handleSingleSelectChange}
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
            const isChecked = Array.isArray(answer) && 
              (answer as string[]).includes(option.id);
            
            return (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => 
                    handleMultiSelectChange(option.id, checked as boolean)
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
          value={(answer as string) || ""}
          onValueChange={handleYesNoChange}
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
  );
};
