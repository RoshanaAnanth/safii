import { useState, useCallback } from 'react';
import { ToastData } from '../components/Toast/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = {
      ...toast,
      id,
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'success', message, title, duration });
  }, [addToast]);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'error', message, title, duration });
  }, [addToast]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'warning', message, title, duration });
  }, [addToast]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'info', message, title, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};