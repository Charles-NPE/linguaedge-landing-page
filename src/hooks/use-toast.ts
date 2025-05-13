
import { useToast as useToastHook } from "@/components/ui/toast-hook";
import { toast as toastFunction } from "@/components/ui/toast-hook";

// Re-export the hook and toast function
export const useToast = useToastHook;
export const toast = toastFunction;
