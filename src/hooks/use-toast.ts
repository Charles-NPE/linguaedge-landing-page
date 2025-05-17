
// Legacy stub – routes everything to the central toastShim

import { toast as shimToast } from "@/lib/toastShim";

/** Re-export so `import { toast } …` keeps working */
export const toast = shimToast;

/**
 * Hook compatibility:
 *   const { toast } = useToast();
 */
export const useToast = () => ({ toast: shimToast });
