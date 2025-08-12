import React from 'react';
import { Link } from 'react-router-dom';
import { FaBug, FaHeart } from 'react-icons/fa';
import styles from './Footer.module.css';
import versionInfo from '../version.json';

/**
 * Footer component that appears at the bottom of all pages
 * Contains links to feedback form and other important pages
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const version = versionInfo?.version || 'dev';
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <Link to="/feedback" className={styles.feedbackLink}>
            <FaBug className={styles.icon} /> Feedback & Bugs
          </Link>
          <Link to="/about" className={styles.link}>About</Link>
          <Link to="/terms" className={styles.link}>Terms</Link>
          <Link to="/privacy" className={styles.link}>Privacy</Link>
        </div>
        <div className={styles.copyright}>
          <p>© {currentYear} OnlyFans. All rights reserved.</p>
          <p className={styles.tagline}>Made with <FaHeart className={styles.heartIcon} /> for fans of fans</p>
          <p className={styles.version}>Version: {version}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;