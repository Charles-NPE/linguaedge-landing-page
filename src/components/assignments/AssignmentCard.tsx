
import React from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Props {
  title: string;
  instructions: string;
  deadline: string | null;
  status: "pending" | "submitted" | "late";
  onSubmit: () => void;
}

const AssignmentCard: React.FC<Props> = ({
  title, instructions, deadline, status, onSubmit
}) => {
  const due = deadline ? formatDistanceToNowStrict(new Date(deadline), { addSuffix: true }) : "No deadline";
  const color =
    status === "pending" ? "text-yellow-600" :
    status === "late"    ? "text-red-600"    :
                           "text-green-600";

  return (
    <Card>
      <CardHeader className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <span className={`text-sm ${color}`}>{status.toUpperCase()}</span>
        <span className="text-xs text-muted-foreground">Due • {due}</span>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-line text-sm">{instructions}</p>
        {status === "pending" && (
          <Button size="sm" onClick={onSubmit}>Submit essay</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
