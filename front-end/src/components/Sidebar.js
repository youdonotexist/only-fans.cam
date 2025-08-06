import React, { useState, useEffect } from 'react';
import {NavLink, Link, useNavigate} from 'react-router-dom';
import { FaHome, FaBell, FaEnvelope, FaUser, FaPlus } from 'react-icons/fa';
import styles from './Sidebar.module.css';
import logo from '../assets/logo.png';
import { getCurrentUser } from '../network/userApi.ts';
import LoginButton from './LoginButton';
import Avatar from './Avatar';

const Sidebar = () => {
    // Sidebar is always visible, no need for toggle state
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    
    // Fetch user data on component mount
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
    
    // Navigation links click handler
    const handleLinkClick = () => {
        // No action needed as sidebar is always visible
    };
    
    // Handle create new post button click
    const handleCreatePost = () => {
        navigate('/?newPost=true');
    };
    
    // Navigation links array for reuse
    const navLinks = [
        { to: "/", icon: <FaHome />, text: "Home" },
        { to: "/notifications", icon: <FaBell />, text: "Notifications" },
        { to: "/messages", icon: <FaEnvelope />, text: "Messages" }
    ];
    
    return (
        <div className={styles.container}>
            {/* Main Sidebar - Always visible */}
            <aside className={styles.sidebar}>
                {/* Logo at the top */}
                <div className={styles.logoContainer}>
                    <Link to="/" className={styles.logo}>
                        <img src={logo} className={styles.logoImg} alt="OnlyFans logo" />
                    </Link>
                </div>
                
                <nav>
                    <ul>
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <NavLink 
                                    to={link.to} 
                                    className={[({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link, `${styles.sidebarLinkText}`].join()}
                                    onClick={handleLinkClick}
                                >
                                    {link.icon} <span>{link.text}</span>
                                </NavLink>
                            </li>
                        ))}
                        
                        {/* User profile avatar in navigation - for mobile layout */}
                        {user && (
                            <li className={styles.userProfileItem}>
                                <div 
                                    className={styles.userProfileLink}
                                    onClick={() => navigate('/profile/me')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Avatar 
                                        src={user.profile_image} 
                                        alt={user.username}
                                        username={user.username}
                                        className={styles.userAvatar}
                                        size={40}
                                    />
                                    <div className={styles.userInfo}>
                                        <span className={styles.username}>@{user.username}</span>
                                    </div>
                                </div>
                            </li>
                        )}
                        
                        {/* Login button for non-logged in users */}
                        {!user && (
                            <li className={styles.loginItem}>
                                <LoginButton className={styles.sidebarLoginButton} />
                            </li>
                        )}
                        
                        {/* Create New Post button - only visible when logged in */}
                        {user && (
                            <li className={styles.createPostItem}>
                                <button 
                                    className={styles.createPostButton}
                                    onClick={handleCreatePost}
                                >
                                    <FaPlus /> <span>New Post</span>
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
                
                {/* Spacer to push content to top and bottom */}
                <div className={styles.spacer}></div>
                
                {/* User profile at the bottom - for desktop layout only */}
                {user && (
                    <div className={styles.userProfileDesktop}>
                        <div 
                            className={styles.userProfileLink}
                            onClick={() => navigate('/profile/me')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Avatar 
                                src={user.profile_image} 
                                alt={user.username}
                                username={user.username}
                                className={styles.userAvatar}
                                size={40}
                            />
                            <div className={styles.userInfo}>
                                <span className={styles.username}>@{user.username}</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Login button for desktop layout */}
                {!user && (
                    <div className={styles.loginDesktop}>
                        <LoginButton className={styles.sidebarLoginButton} />
                    </div>
                )}
                
            </aside>
            
            {/* Mobile Bottom Navigation - No longer needed as sidebar is always visible */}
        </div>
    );
};

export default Sidebar;
