
import { useToast as useToastOriginal, toast as toastOriginal } from "@/components/ui/toast";

// Re-export the hook and toast function
export const useToast = useToastOriginal;
export const toast = toastOriginal;
