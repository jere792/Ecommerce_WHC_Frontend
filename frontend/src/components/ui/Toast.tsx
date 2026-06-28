import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />,
  error: <XCircle className="w-5 h-5" style={{ color: 'var(--destructive)' }} />,
  warning: <AlertCircle className="w-5 h-5" style={{ color: 'var(--warning)' }} />,
  info: <Info className="w-5 h-5" style={{ color: 'var(--info)' }} />,
};

const styleMap: Record<ToastVariant, string> = {
  success: "bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)]",
  error: "bg-[var(--destructive-bg)] border-[var(--destructive)] text-[var(--destructive)]",
  warning: "bg-[var(--warning-bg)] border-[var(--warning)] text-[var(--warning)]",
  info: "bg-[var(--info-bg)] border-[var(--info)] text-[var(--info)]",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in slide-in-from-right ${styleMap[toast.variant]}`}
            role="alert"
          >
            <span className="flex-shrink-0 mt-0.5">{iconMap[toast.variant]}</span>
            <p className="flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
