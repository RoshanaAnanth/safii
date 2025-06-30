import React from 'react';
import Toast, { ToastData } from '../Toast/Toast';
import styles from '../Toast/Toast.module.scss';

interface ToastContainerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;