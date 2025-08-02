import React from 'react';
import {NavLink} from 'react-router-dom';
import { FaHome, FaBell, FaEnvelope, FaUser } from 'react-icons/fa';
import styles from './Sidebar.module.css';
import LoginButton from './LoginButton';

const Sidebar = () => {
    // Sidebar is always visible, no need for toggle state
    
    // Navigation links click handler
    const handleLinkClick = () => {
        // No action needed as sidebar is always visible
    };
    
    // Navigation links array for reuse
    const navLinks = [
        { to: "/", icon: <FaHome />, text: "Home" },
        { to: "/notifications", icon: <FaBell />, text: "Notifications" },
        { to: "/messages", icon: <FaEnvelope />, text: "Messages" },
        { to: "/profile/me", icon: <FaUser />, text: "My Profile" }
    ];
    
    return (
        <div className={styles.container}>
            {/* Main Sidebar - Always visible */}
            <aside className={styles.sidebar}>
                <nav>
                    <ul>
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <NavLink 
                                    to={link.to} 
                                    className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                                    onClick={handleLinkClick}
                                >
                                    {link.icon} <span>{link.text}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <LoginButton className={styles.sidebarLoginButton} />
            </aside>
            
            {/* Mobile Bottom Navigation - No longer needed as sidebar is always visible */}
        </div>
    );
};

export default Sidebar;
