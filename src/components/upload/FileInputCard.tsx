
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Check } from "lucide-react";

interface FileInputCardProps {
  title: string;
  description: string;
  fileInputId: string;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileInputCard: FC<FileInputCardProps> = ({
  title,
  description,
  fileInputId,
  file,
  onFileChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="mb-4 text-sm text-muted-foreground">
            {description}
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id={fileInputId}
            onChange={onFileChange}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById(fileInputId)?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Select File
          </Button>
          {file && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: {file.name}
              <Check className="inline-block ml-1 h-4 w-4 text-green-500" />
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
