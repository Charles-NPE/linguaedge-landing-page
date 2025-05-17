
// Legacy compatibility stub – routes all calls to the new shim
export { toast } from "@/lib/toastShim";

/** Allows: const { toast } = useToast(); */
export const useToast = () => ({ toast });
