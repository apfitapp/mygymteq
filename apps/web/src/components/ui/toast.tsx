import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (variant: ToastVariant, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id = ++toastId;
      setToasts((prev) => [...prev.slice(-3), { id, variant, title, description }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), variant === 'error' ? 6000 : 4000)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const current = timers.current;
    return () => current.forEach((t) => clearTimeout(t));
  }, []);

  const icons: Record<ToastVariant, React.ReactNode> = {
    success: <CheckCircle2 className="size-4 text-ok shrink-0" />,
    error: <AlertCircle className="size-4 text-destructive shrink-0" />,
    info: <Info className="size-4 text-primary shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-2.5 rounded-md border border-border bg-card/95 backdrop-blur-md px-3.5 py-3 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
            {icons[t.variant]}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground leading-tight">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug break-words">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-xs p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
