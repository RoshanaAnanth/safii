import React, { useEffect, useState } from 'react';
import styles from './Toast.module.scss';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className={`${styles.toastIcon} ${styles.success}`} />;
      case 'error':
        return <ErrorIcon className={`${styles.toastIcon} ${styles.error}`} />;
      case 'warning':
        return <WarningIcon className={`${styles.toastIcon} ${styles.warning}`} />;
      case 'info':
        return <InfoIcon className={`${styles.toastIcon} ${styles.info}`} />;
      default:
        return <InfoIcon className={`${styles.toastIcon} ${styles.info}`} />;
    }
  };

  const getTitle = () => {
    if (toast.title) return toast.title;
    
    switch (toast.type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Notification';
    }
  };

  return (
    <div className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}>
      {getIcon()}
      <div className={styles.toastContent}>
        <h4 className={`${styles.toastTitle} ${styles[toast.type]}`}>
          {getTitle()}
        </h4>
        <p className={`${styles.toastMessage} ${styles[toast.type]}`}>
          {toast.message}
        </p>
      </div>
      <button 
        onClick={handleClose}
        className={styles.closeButton}
        aria-label="Close notification"
      >
        <CloseIcon className={styles.closeIcon} />
      </button>
      <div 
        className={styles.progressBar}
        style={{ 
          animationDuration: `${toast.duration || 5000}ms`,
          color: toast.type === 'success' ? '#10b981' : 
                 toast.type === 'error' ? '#ef4444' :
                 toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
        }}
      />
    </div>
  );
};

export default Toast;