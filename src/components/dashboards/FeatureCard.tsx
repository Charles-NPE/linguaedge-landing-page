
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <Card 
      className={`border border-border shadow-md transition-all hover:shadow-lg dark:border-slate-700 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="mb-2 h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center dark:from-indigo-600 dark:to-violet-500">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-xl text-slate-900 dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="dark:text-slate-300">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
