import React, { useState } from 'react';
import {NavLink} from 'react-router-dom';
import { FaHome, FaBell, FaEnvelope, FaUser } from 'react-icons/fa';
import styles from './Sidebar.module.css';
import LoginButton from './LoginButton';
import TopNavbar from './TopNavbar';

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    
    // Close sidebar when clicking on a link (mobile only)
    const handleLinkClick = () => {
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
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
            {/* Top Navigation Bar */}
            <TopNavbar 
                toggleSidebar={toggleSidebar} 
                isSidebarOpen={isSidebarOpen} 
            />
            
            {/* Main Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <nav>
                    <ul>
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <NavLink 
                                    to={link.to} 
                                    className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                                    onClick={handleLinkClick}
                                >
                                    {link.icon} {link.text}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <LoginButton className={styles.sidebarLoginButton} />
            </aside>
            
            {/* Mobile Bottom Navigation */}
            <nav className={styles.mobileNav}>
                <ul>
                    {navLinks.map((link) => (
                        <li key={link.to}>
                            <NavLink 
                                to={link.to} 
                                className={({ isActive }) => isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink}
                            >
                                {link.icon}
                                <span>{link.text}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
