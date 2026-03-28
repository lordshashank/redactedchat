"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

type ToastType = "error" | "success" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  toastError: (message: string) => void;
  toastSuccess: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  toastError: () => {},
  toastSuccess: () => {},
});

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = String(++toastId);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastError = useCallback(
    (message: string) => addToast(message, "error"),
    [addToast]
  );

  const toastSuccess = useCallback(
    (message: string) => addToast(message, "success"),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, toastError, toastSuccess }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const borderColor =
    toast.type === "error"
      ? "border-red-500/60"
      : toast.type === "success"
        ? "border-primary/60"
        : "border-outline";

  return (
    <div
      className={`bg-surface-container border ${borderColor} px-4 py-3 text-sm text-on-surface font-mono flex items-start gap-3 animate-in slide-in-from-right`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-on-surface-variant/60 hover:text-on-surface text-xs"
      >
        X
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
