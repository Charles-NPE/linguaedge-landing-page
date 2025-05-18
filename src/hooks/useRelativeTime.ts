
import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { toZonedTime } from "date-fns-tz";

/**
 * Parse Supabase timestamp that comes without timezone info
 * by appending 'Z' to indicate it's UTC
 */
const parseSupabaseTimestamp = (raw: string) => new Date(`${raw}Z`);

export const useRelativeTime = (iso: string) => {
  const getLabel = () => {
    try {
      return formatDistanceToNowStrict(
        toZonedTime(parseSupabaseTimestamp(iso), Intl.DateTimeFormat().resolvedOptions().timeZone),
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
