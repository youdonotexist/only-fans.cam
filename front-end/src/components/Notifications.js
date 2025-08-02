import React from 'react';
import styles from './Notifications.module.css';
import Sidebar from "./Sidebar";
import { FaBell } from 'react-icons/fa';
import NotificationList from './NotificationList';

const Notifications = () => {

    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1><FaBell /> Notifications</h1>
                </div>
                
                <div className={styles.notificationsContainer}>
                    {/* Use our new NotificationList component */}
                    <NotificationList />
                </div>
            </main>
        </div>
    );
};

export default Notifications;
