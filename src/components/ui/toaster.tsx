
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster 
      className="toaster group" 
      toastOptions={{
        classNames: {
          toast: "group toast",
          title: "toast-title",
          description: "toast-description",
          actionButton: "toast-action",
          closeButton: "toast-close",
          success: "success",
          error: "error",
          info: "info",
          warning: "warning",
        }
      }}
    />
  )
}
