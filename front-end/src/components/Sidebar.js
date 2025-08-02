import React from 'react';
import {NavLink} from 'react-router-dom';
import { FaHome, FaBell, FaEnvelope, FaUser, FaBars } from 'react-icons/fa';
import styles from './Sidebar.module.css';
import fanIcon from '../assets/fan.png';
import LoginButton from './LoginButton';

const Sidebar = () => {
    return (
            <aside className={styles.sidebar}>
                    <div className={styles.logo}>
                        <img src={fanIcon} className={styles.logoImg} />
                        OnlyFans
                    </div>

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
