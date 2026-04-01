"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmVariant = "default" | "destructive";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
};

type AppFeedbackContextValue = {
  notifySuccess: (message: string, description?: string) => void;
  notifyError: (message: string, description?: string, critical?: boolean) => void;
  notifyPending: (message: string, description?: string) => string | number;
  dismiss: (id: string | number) => void;
  confirmDestructive: (options: ConfirmOptions) => Promise<boolean>;
};

type ConfirmState = {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
};

const AppFeedbackContext = createContext<AppFeedbackContextValue | null>(null);

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const notifySuccess = useCallback((message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 2500,
    });
  }, []);

  const notifyError = useCallback((message: string, description?: string, critical = false) => {
    toast.error(message, {
      description,
      duration: critical ? Infinity : 4500,
      dismissible: true,
    });
  }, []);

  const notifyPending = useCallback((message: string, description?: string) => {
    return toast.loading(message, {
      description,
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      duration: Infinity,
    });
  }, []);

  const dismiss = useCallback((id: string | number) => {
    toast.dismiss(id);
  }, []);

  const confirmDestructive = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setConfirmState({ options, resolve });
    });
  }, []);

  const closeConfirm = useCallback((value: boolean) => {
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
    if (confirmState) {
      confirmState.resolve(value);
    }
    setConfirmState(null);
  }, [confirmState]);

  const value = useMemo<AppFeedbackContextValue>(
    () => ({ notifySuccess, notifyError, notifyPending, dismiss, confirmDestructive }),
    [dismiss, notifyError, notifyPending, notifySuccess, confirmDestructive],
  );

  return (
    <AppFeedbackContext.Provider value={value}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          className: "border border-white/10 bg-black/80 text-foreground",
        }}
      />

      <Dialog open={Boolean(confirmState)} onOpenChange={(open) => !open && closeConfirm(false)}>
        <DialogContent className="max-w-md border-white/10 bg-black/90 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-destructive" />
              {confirmState?.options.title ?? "Confirmar acao"}
            </DialogTitle>
            {confirmState?.options.description ? (
              <DialogDescription>{confirmState.options.description}</DialogDescription>
            ) : null}
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => closeConfirm(false)}>
              {confirmState?.options.cancelText ?? "Cancelar"}
            </Button>
            <Button
              variant={confirmState?.options.variant === "destructive" ? "destructive" : "default"}
              onClick={() => closeConfirm(true)}
            >
              {confirmState?.options.confirmText ?? "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppFeedbackContext.Provider>
  );
}

export function useAppFeedback() {
  const context = useContext(AppFeedbackContext);
  if (!context) {
    throw new Error("useAppFeedback must be used within AppFeedbackProvider");
  }
  return context;
}
