"use client";
import React, { createContext, useState, useContext } from 'react';
import { ToastType } from '@/components/Toast';

type ToastContextType = {
  toasts: ToastType[];
  setToasts: React.Dispatch<React.SetStateAction<Array<ToastType>>>;
  updateToasts: (message: string, success: boolean) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

    function updateToasts(message: string, success: boolean) {
        setToasts((prev) => {
            const newToast = { id: Date.now(), message, success };
            const updatedToasts = [newToast, ...prev];
            return updatedToasts.slice(0, 2);
        });
    }

  return (
    <ToastContext.Provider value={{ toasts, setToasts, updateToasts }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
