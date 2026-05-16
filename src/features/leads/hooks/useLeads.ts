import { useQuery } from "@tanstack/react-query";
import { getLeads } from "../api/leads";

export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"], // This is the unique cache key for this data
    queryFn: getLeads,   // The API function we just wrote
  });
};