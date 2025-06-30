import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import React from 'react';
import styles from './LoadingOverlay.module.scss';

interface LoadingOverlayProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = "Loading...", 
  size = 'medium' 
}) => {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.content} ${styles[size]}`}>
        <DotLottieReact
          src="https://lottie.host/53d9f123-78b9-47cf-8a65-0ed27fadb9a5/NhPcrLwE7g.lottie"
          loop
          autoplay
          className={styles.lottie}
        />
        {message && (
          <p className={styles.message}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;