import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaCheckDouble, FaComment, FaHeart, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../network/notificationApi.ts';
import './NotificationList.css';

const NotificationList = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to view notifications');
        setLoading(false);
        return;
      }
      
      const response = await getNotifications(token, page);
      
      if (page === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setHasMore(page < response.pagination.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to mark notifications as read');
        return;
      }
      
      await markNotificationAsRead(id, token);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to mark notifications as read');
        return;
      }
      
      await markAllNotificationsAsRead(token);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err.message || 'Failed to mark all notifications as read');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'comment' || notification.type === 'like') {
      navigate(`/fandetails/${notification.fan_id}`);
    } else if (notification.type === 'follow') {
      navigate(`/user/${notification.actor_username}`);
    }
    
    // Close notification panel if provided
    if (onClose) {
      onClose();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return <FaComment className="notification-icon comment" />;
      case 'like':
        return <FaHeart className="notification-icon like" />;
      case 'follow':
        return <FaUserPlus className="notification-icon follow" />;
      default:
        return <FaBell className="notification-icon" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else if (diffDay < 7) {
      return `${diffDay}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && page === 1) {
    return (
      <div className="notification-list">
        <div className="notification-header">
          <h3>Notifications</h3>
        </div>
        <div className="notification-loading">Loading notifications...</div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="notification-list">
        <div className="notification-header">
          <h3>Notifications</h3>
        </div>
        <div className="notification-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button 
          className="mark-all-read-btn" 
          onClick={handleMarkAllAsRead}
          disabled={notifications.every(n => n.is_read)}
        >
          <FaCheckDouble /> Mark all as read
        </button>
      </div>
      
      {notifications.length === 0 ? (
        <div className="no-notifications">
          <FaBell className="empty-icon" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <>
          <div className="notification-items">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-content">
                  <div className="notification-icon-container">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-details">
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatDate(notification.created_at)}</div>
                  </div>
                </div>
                {!notification.is_read && (
                  <button 
                    className="mark-read-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                  >
                    <FaCheck />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="load-more-container">
              <button 
                className="load-more-btn" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
      
      {error && (
        <div className="notification-footer-error">{error}</div>
      )}
    </div>
  );
};

export default NotificationList;