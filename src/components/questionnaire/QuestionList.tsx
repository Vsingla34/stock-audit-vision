
import { useState } from "react";
import { Question, useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus, ListCheck } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { QuestionForm } from "./QuestionForm";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const QuestionList = () => {
  const { questions, deleteQuestion } = useInventory();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | undefined>();

  const handleAddClick = () => {
    setSelectedQuestion(undefined);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (question: Question) => {
    setSelectedQuestion(question);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedQuestion) {
      deleteQuestion(selectedQuestion.id);
      setIsDeleteDialogOpen(false);
      toast.success("Question deleted successfully");
    }
  };

  const getQuestionTypeLabel = (type: Question["type"]) => {
    switch (type) {
      case "text": return "Text";
      case "singleSelect": return "Single Select";
      case "multiSelect": return "Multi Select";
      case "yesNo": return "Yes/No";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <ListCheck className="h-5 w-5 mr-2" />
          Audit Questionnaire
        </h2>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="bg-muted/20">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                No questions have been created yet.
              </p>
              <Button onClick={handleAddClick} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create your first question
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id} className="hover:bg-accent/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                      {question.required && <Badge>Required</Badge>}
                    </div>
                    <p className="font-medium">{question.text}</p>
                    
                    {(question.type === "singleSelect" || question.type === "multiSelect") && question.options && question.options.length > 0 && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p className="mb-1">Options:</p>
                        <ul className="list-disc list-inside space-y-0.5 pl-2">
                          {question.options.map((option) => (
                            <li key={option.id}>{option.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="ghost" onClick={() => handleEditClick(question)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(question)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Question Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <QuestionForm 
            onSave={() => setIsAddDialogOpen(false)} 
            onCancel={() => setIsAddDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <QuestionForm 
            question={selectedQuestion}
            onSave={() => setIsEditDialogOpen(false)} 
            onCancel={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
