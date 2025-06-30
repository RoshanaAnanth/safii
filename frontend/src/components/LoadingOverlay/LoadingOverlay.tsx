import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import React from "react";
import styles from "./LoadingOverlay.module.scss";

interface LoadingOverlayProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Loading...",
  size = "medium",
}) => {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.content} ${styles[size]}`}>
        <DotLottieReact
          src="https://lottie.host/a42f521b-b09e-4a67-8d40-4d3693993388/ezE4R362dO.lottie"
          loop
          autoplay
          className={styles.lottie}
        />
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
