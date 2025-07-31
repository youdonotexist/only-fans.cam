import React from 'react';
import styles from './Notifications.module.css';
import Sidebar from "./Sidebar";

const Notifications = () => {
    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
                <h1>Notifications</h1>
                <p>This is the notifications page.</p>
            </main>
        </div>
    );
};

export default Notifications;
