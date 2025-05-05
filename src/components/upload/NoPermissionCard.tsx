
import { FC } from "react";
import { Card } from "@/components/ui/card";

export const NoPermissionCard: FC = () => {
  return (
    <Card className="md:col-span-2 p-6">
      <p className="text-center text-muted-foreground">You don't have permission to upload inventory data.</p>
    </Card>
  );
};
