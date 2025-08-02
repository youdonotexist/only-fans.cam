import React, { useState, useEffect } from 'react';
import {NavLink} from 'react-router-dom';
import { FaHome, FaBell, FaEnvelope, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import styles from './Sidebar.module.css';
import fanIcon from '../assets/fan.png';
import LoginButton from './LoginButton';
import { getCurrentUser } from '../network/userApi.ts';

const Sidebar = () => {
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await getCurrentUser(token);
                    setUser(userData);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };
        
        fetchUser();
    }, []);
    
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
            {/* Main Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    <img src={fanIcon} className={styles.logoImg} alt="Fan icon" />
                    OnlyFans
                </div>
                
                {user && (
                    <div className={styles.userInfo}>
                        <img 
                            src={user.profile_image || "https://via.placeholder.com/40"} 
                            alt={user.username}
                            className={styles.userAvatar} 
                        />
                        <span className={styles.username}>@{user.username}</span>
                    </div>
                )}

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
            
            {/* Mobile Toggle Button */}
            <button 
                className={styles.sidebarToggle} 
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            
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
