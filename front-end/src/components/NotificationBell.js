import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { getUnreadNotificationCount } from '../network/notificationApi.ts';
import NotificationList from './NotificationList';
import './NotificationList.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    // Fetch unread count on mount
    fetchUnreadCount();

    // Set up interval to fetch unread count every minute
    const intervalId = setInterval(fetchUnreadCount, 60000);

    // Add click event listener to close notifications when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        // User not logged in, don't show error
        setUnreadCount(0);
        setLoading(false);
        return;
      }
      
      const response = await getUnreadNotificationCount(token);
      setUnreadCount(response.count);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching unread count:', err);
      setError(err.message || 'Failed to load unread count');
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  const handleNotificationsClosed = () => {
    // Refresh unread count when notifications are closed
    fetchUnreadCount();
  };

  return (
    <div className="notification-bell-container" ref={notificationRef}>
      <div className="notification-bell" onClick={toggleNotifications}>
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-counter">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      
      {showNotifications && (
        <div className="notification-dropdown">
          <NotificationList onClose={() => {
            setShowNotifications(false);
            handleNotificationsClosed();
          }} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;