import React from 'react';
import styles from './Notifications.module.css';
import Sidebar from "./Sidebar";
import { FaBell } from 'react-icons/fa';
import NotificationList from './NotificationList';
import PageLayout from './PageLayout';

const Notifications = () => {

    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
                <PageLayout title="Notifications">
                    <div className={styles.notificationsContainer}>
                        {/* Use our new NotificationList component */}
                        <NotificationList />
                    </div>
                </PageLayout>
            </main>
        </div>
    );
};

export default Notifications;
