import React from 'react';
import {NavLink, Link, useNavigate} from 'react-router-dom';
import { FaHome, FaBell, FaEnvelope, FaPlus, FaBook } from 'react-icons/fa';
import styles from './Sidebar.module.css';
import logo from '../assets/logo.png';
import LoginButton from './LoginButton';
import Avatar from './Avatar';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();

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
        { to: "/messages", icon: <FaEnvelope />, text: "Messages" },
        { to: "/fanwiki", icon: <FaBook />, text: "Fan Wiki" }
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
                                    className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                                    onClick={handleLinkClick}
                                >
                                    {link.icon} <span className={styles.sidebarLinkText}>{link.text}</span>
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
