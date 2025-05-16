
// Re-export sonner's toast functionality
import { toast, useToast as sonnerUseToast } from "sonner";

// Export the useToast hook from sonner
export const useToast = sonnerUseToast;
export { toast };
