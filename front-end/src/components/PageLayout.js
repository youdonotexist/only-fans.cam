import React from 'react';
import BackButton from './BackButton';
import styles from './PageLayout.module.css';

/**
 * Common layout component for pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @param {boolean} props.showBackButton - Whether to show the back button
 * @param {string} props.className - Additional CSS class for the container
 */
const PageLayout = ({ 
  children, 
  title, 
  showBackButton = true, 
  className = '' 
}) => {
  return (
    <div className={`${styles.pageContainer} ${className}`}>
      <div className={styles.pageHeader}>
        {showBackButton && <BackButton />}
        {title && <h1 className={styles.pageTitle}>{title}</h1>}
      </div>
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;