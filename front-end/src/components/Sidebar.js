import React, { useState, useEffect } from 'react';
import {NavLink} from 'react-router-dom';
import { FaHome, FaBell, FaEnvelope, FaUser, FaBars } from 'react-icons/fa';
import styles from './Sidebar.module.css';
import fanIcon from '../assets/fan.png';
import LoginButton from './LoginButton';
import { getCurrentUser } from '../network/userApi.ts';

const Sidebar = () => {
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
            <aside className={styles.sidebar}>
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
                        <li><NavLink to="/" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}><FaHome /> Home</NavLink></li>
                        <li><NavLink to="/notifications" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}><FaBell /> Notifications</NavLink></li>
                        <li><NavLink to="/messages" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}><FaEnvelope /> Messages</NavLink></li>
                        <li><NavLink to="/profile/me" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}><FaUser /> My Profile</NavLink></li>
                    </ul>
                </nav>
                <LoginButton className={styles.sidebarLoginButton} />
            </aside>
    );
};

export default Sidebar;
