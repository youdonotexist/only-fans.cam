import React from 'react';
import BackButton from './BackButton';
import styles from './TopNavBar.module.css';

/**
 * Top navigation bar component that contains the back button and page title
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {boolean} props.showBackButton - Whether to show the back button
 * @param {React.ReactNode} props.rightContent - Optional content to display on the right side
 * @param {string} props.className - Additional CSS class for the container
 */
const TopNavBar = ({ 
  title, 
  showBackButton = true, 
  rightContent,
  className = '' 
}) => {
  return (
    <div className={`${styles.topNavBar} ${className}`}>
      <div className={styles.leftSection}>
        {showBackButton && <BackButton className={styles.backButton} />}
        {title && <h1 className={styles.pageTitle}>{title}</h1>}
      </div>
      {rightContent && (
        <div className={styles.rightSection}>
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default TopNavBar;