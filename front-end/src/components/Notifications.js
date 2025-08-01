import React, { useState } from 'react';
import styles from './Notifications.module.css';
import Sidebar from "./Sidebar";
import { FaBell, FaHeart, FaComment, FaUser, FaStar, FaTrash, FaCheck, FaEllipsisH } from 'react-icons/fa';

const Notifications = () => {
    // Sample notifications data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'like',
            title: 'New Like',
            message: 'FanMaster liked your Industrial Fan post',
            time: '2 minutes ago',
            unread: true
        },
        {
            id: 2,
            type: 'comment',
            title: 'New Comment',
            message: 'CeilingFanEnthusiast commented on your Vintage Ceiling Fan post: "This is amazing!"',
            time: '1 hour ago',
            unread: true
        },
        {
            id: 3,
            type: 'follow',
            title: 'New Follower',
            message: 'TableFanLover started following you',
            time: '3 hours ago',
            unread: false
        },
        {
            id: 4,
            type: 'feature',
            title: 'Featured Post',
            message: 'Your Luxury Floor Fan post was featured in the weekly highlights',
            time: '1 day ago',
            unread: false
        }
    ]);

    // Mark notification as read
    const markAsRead = (id) => {
        setNotifications(notifications.map(notification => 
            notification.id === id ? { ...notification, unread: false } : notification
        ));
    };

    // Delete notification
    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notification => notification.id !== id));
    };

    // Get icon based on notification type
    const getNotificationIcon = (type) => {
        switch(type) {
            case 'like':
                return <FaHeart />;
            case 'comment':
                return <FaComment />;
            case 'follow':
                return <FaUser />;
            case 'feature':
                return <FaStar />;
            default:
                return <FaBell />;
        }
    };

    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1><FaBell /> Notifications</h1>
                </div>

                {notifications.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaBell />
                        <h2>No notifications yet</h2>
                        <p>When you get notifications, they'll show up here</p>
                    </div>
                ) : (
                    <div className={styles.notificationList}>
                        {notifications.map(notification => (
                            <div 
                                key={notification.id} 
                                className={`${styles.notificationItem} ${notification.unread ? styles.unread : ''}`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className={styles.notificationIcon}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className={styles.notificationContent}>
                                    <div className={styles.notificationTitle}>{notification.title}</div>
                                    <div className={styles.notificationMessage}>{notification.message}</div>
                                    <div className={styles.notificationTime}>{notification.time}</div>
                                </div>
                                <div className={styles.notificationActions}>
                                    {notification.unread && (
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }} title="Mark as read">
                                            <FaCheck />
                                        </button>
                                    )}
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }} title="Delete notification">
                                        <FaTrash />
                                    </button>
                                    <button title="More options">
                                        <FaEllipsisH />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Notifications;
