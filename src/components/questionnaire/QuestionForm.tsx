
import { useState, useEffect } from "react";
import { Question, QuestionOption, QuestionType, useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { X, Plus, Save } from "lucide-react";
import { toast } from "sonner";

interface QuestionFormProps {
  question?: Question;
  onSave: () => void;
  onCancel: () => void;
}

export const QuestionForm = ({ question, onSave, onCancel }: QuestionFormProps) => {
  const { addQuestion, updateQuestion } = useInventory();
  
  const [text, setText] = useState(question?.text || "");
  const [type, setType] = useState<QuestionType>(question?.type || "text");
  const [required, setRequired] = useState(question?.required ?? true);
  const [options, setOptions] = useState<QuestionOption[]>(
    question?.options || [{ id: `opt-${Date.now()}-1`, text: "" }]
  );

  // Reset form if question changes
  useEffect(() => {
    if (question) {
      setText(question.text);
      setType(question.type);
      setRequired(question.required);
      setOptions(question.options || [{ id: `opt-${Date.now()}-1`, text: "" }]);
    } else {
      setText("");
      setType("text");
      setRequired(true);
      setOptions([{ id: `opt-${Date.now()}-1`, text: "" }]);
    }
  }, [question]);

  const handleAddOption = () => {
    setOptions([...options, { id: `opt-${Date.now()}`, text: "" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 1) {
      setOptions(options.filter(opt => opt.id !== id));
    } else {
      toast.error("You must have at least one option");
    }
  };

  const handleOptionChange = (id: string, value: string) => {
    setOptions(
      options.map(opt => (opt.id === id ? { ...opt, text: value } : opt))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!text.trim()) {
      toast.error("Question text is required");
      return;
    }
    
    // For question types that need options, validate them
    if ((type === "singleSelect" || type === "multiSelect") && options.some(opt => !opt.text.trim())) {
      toast.error("All options must have text");
      return;
    }

    const questionData = {
      text,
      type,
      required,
      options: type === "singleSelect" || type === "multiSelect" ? options : undefined
    };

    try {
      if (question) {
        updateQuestion({ ...question, ...questionData });
        toast.success("Question updated successfully");
      } else {
        addQuestion(questionData);
        toast.success("Question added successfully");
      }
      onSave();
    } catch (error) {
      toast.error("Error saving question");
      console.error(error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{question ? "Edit Question" : "Add New Question"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text</Label>
            <Textarea
              id="question-text"
              placeholder="Enter your question here..."
              value={text}
              onChange={e => setText(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-type">Question Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as QuestionType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Answer</SelectItem>
                <SelectItem value="singleSelect">Single Select</SelectItem>
                <SelectItem value="multiSelect">Multiple Select</SelectItem>
                <SelectItem value="yesNo">Yes/No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="required">Required Question</Label>
            <Switch 
              id="required"
              checked={required}
              onCheckedChange={setRequired}
            />
          </div>

          {(type === "singleSelect" || type === "multiSelect") && (
            <div className="space-y-4">
              <Label>Answer Options</Label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div 
                    key={option.id} 
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={e => handleOptionChange(option.id, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(option.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Option
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          {question ? "Update Question" : "Add Question"}
        </Button>
      </CardFooter>
    </Card>
  );
};
