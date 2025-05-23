
import React from "react";
import { useRelativeTime } from "@/hooks/useRelativeTime";

interface Props {
  date: string | Date;
  className?: string;
}

const RelativeTime: React.FC<Props> = ({ date, className }) => {
  const label = useRelativeTime(typeof date === 'string' ? date : date.toISOString());
  return <span className={className}>{label}</span>;
};

export default RelativeTime;
