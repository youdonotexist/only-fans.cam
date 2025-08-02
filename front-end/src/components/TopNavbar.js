import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './TopNavbar.module.css';
import fanIcon from '../assets/fan.png';
import { getCurrentUser } from '../network/userApi.ts';

const TopNavbar = ({ toggleSidebar, isSidebarOpen }) => {
    const [user, setUser] = useState(null);
    
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
    
    return (
        <header className={styles.topNavbar}>
            <div className={styles.navbarContent}>
                {/* Logo */}
                <div className={styles.logoContainer}>
                    <Link to="/" className={styles.logo}>
                        <img src={fanIcon} className={styles.logoImg} alt="Fan icon" />
                        <span className={styles.logoText}>OnlyFans</span>
                    </Link>
                </div>
                
                {/* Right side - User info and hamburger menu */}
                <div className={styles.navbarRight}>
                    {/* User info - only show if logged in */}
                    {user && (
                        <Link to="/profile/me" className={styles.userInfo}>
                            <img 
                                src={user.profile_image || "https://via.placeholder.com/40"} 
                                alt={user.username}
                                className={styles.userAvatar} 
                            />
                            <span className={styles.username}>@{user.username}</span>
                        </Link>
                    )}
                    
                    {/* Hamburger menu button - only visible on mobile */}
                    <button 
                        className={styles.hamburgerButton} 
                        onClick={toggleSidebar}
                        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;