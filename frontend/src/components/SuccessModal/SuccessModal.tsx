import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import React, { useEffect } from "react";
import styles from "./SuccessModal.module.scss";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoCloseDelay?: number; // in milliseconds
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Success!",
  message = "Your report has been submitted.",
  autoCloseDelay = 0,
}) => {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <IconButton onClick={onClose} className={styles.closeButton}>
          <CloseIcon className={styles.closeIcon} />
        </IconButton>

        <div className={styles.content}>
          <DotLottieReact
            src="https://lottie.host/deb8c2d5-28b4-4a4d-a57a-02b72b051e26/LVfcavzCBE.lottie"
            loop
            autoplay
            className={styles.lottie}
          />

          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
