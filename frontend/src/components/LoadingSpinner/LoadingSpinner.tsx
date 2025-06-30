import React from 'react';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'primary',
  className = '' 
}) => {
  return (
    <div className={`${styles.spinner} ${styles[size]} ${styles[color]} ${className}`}>
      <div className={styles.circle}></div>
    </div>
  );
};

export default LoadingSpinner;