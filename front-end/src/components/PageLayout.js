import React from 'react';
import Topnavbar from './TopNavbar';
import styles from './PageLayout.module.css';

/**
 * Common layout component for pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @param {boolean} props.showBackButton - Whether to show the back button
 * @param {React.ReactNode} props.rightContent - Optional content to display on the right side of the top nav bar
 * @param {string} props.className - Additional CSS class for the container
 */
const PageLayout = ({ 
  children, 
  title, 
  showBackButton = true,
  rightContent,
  className = '' 
}) => {
  return (
    <div className={`${styles.pageContainer} ${className}`}>
      <Topnavbar 
        title={title}
        showBackButton={showBackButton}
        rightContent={rightContent}
      />
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;