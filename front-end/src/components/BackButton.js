import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigation } from '../contexts/NavigationContext';
import styles from './BackButton.module.css';

const BackButton = ({ className }) => {
  const { goBack, canGoBack } = useNavigation();

  if (!canGoBack) {
    return null; // Don't render if we can't go back
  }

  return (
    <button 
      className={`${styles.backButton} ${className || ''}`}
      onClick={goBack}
      aria-label="Go back"
    >
      <FaArrowLeft /> Back
    </button>
  );
};

export default BackButton;