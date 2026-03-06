import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  // Agrupamos los toasts por su posición deseada
  const toastsByPosition = toasts.reduce(
    (acc, toast) => {
      const position = toast.position || "bottom-right";
      if (!acc[position]) acc[position] = [];
      acc[position].push(toast);
      return acc;
    },
    {} as Record<string, typeof toasts>,
  );

  return (
    <ToastProvider>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <React.Fragment key={position}>
          {positionToasts.map(function ({
            id,
            title,
            description,
            action,
            ...props
          }) {
            return (
              <Toast key={id} {...props}>
                <div className="grid gap-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose />
              </Toast>
            );
          })}
          <ToastViewport position={position as any} />
        </React.Fragment>
      ))}
    </ToastProvider>
  );
}
