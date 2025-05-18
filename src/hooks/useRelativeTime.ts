
import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const useRelativeTime = (iso: string) => {
  const getLabel = () => {
    try {
      return formatDistanceToNowStrict(
        toZonedTime(new Date(iso), Intl.DateTimeFormat().resolvedOptions().timeZone),
        { addSuffix: true }
      );
    } catch (error) {
      return "some time ago";
    }
  };

  const [label, setLabel] = useState(getLabel);

  useEffect(() => {
    const id = setInterval(() => setLabel(getLabel), 60_000); // update every min
    return () => clearInterval(id);
  }, [iso]);

  return label;
};
