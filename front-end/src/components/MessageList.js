import React from 'react';
import { FaCircle } from 'react-icons/fa';
import styles from './MessageList.module.css';

const MessageList = ({ conversations, onSelectConversation, selectedConversationId }) => {
  // Helper function to format date
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

  // Helper function to get the other user's info
  const getOtherUserInfo = (conversation) => {
    const currentUserId = parseInt(localStorage.getItem('userId'));
    
    if (conversation.user1_id === currentUserId) {
      return {
        id: conversation.user2_id,
        username: conversation.user2_username,
        profileImage: conversation.user2_profile_image
      };
    } else {
      return {
        id: conversation.user1_id,
        username: conversation.user1_username,
        profileImage: conversation.user1_profile_image
      };
    }
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (conversations.length === 0) {
    return (
      <div className={styles.emptyList}>
        <p>No conversations yet</p>
        <p className={styles.emptyListSubtext}>Start a new conversation by clicking the "New Message" button.</p>
      </div>
    );
  }

  return (
    <div className={styles.messageList}>
      {conversations.map(conversation => {
        const otherUser = getOtherUserInfo(conversation);
        const isSelected = selectedConversationId === conversation.id;
        
        return (
          <div 
            key={conversation.id}
            className={`${styles.conversationItem} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className={styles.avatarContainer}>
              <img 
                src={otherUser.profileImage || "https://via.placeholder.com/40"}
                alt={otherUser.username}
                className={styles.avatar}
              />
              {conversation.unread_count > 0 && (
                <div className={styles.unreadBadge}>
                  {conversation.unread_count}
                </div>
              )}
            </div>
            
            <div className={styles.conversationInfo}>
              <div className={styles.conversationHeader}>
                <h3 className={styles.username}>{otherUser.username}</h3>
                <span className={styles.time}>{formatDate(conversation.last_message_at)}</span>
              </div>
              
              <div className={styles.lastMessage}>
                {conversation.unread_count > 0 ? (
                  <div className={styles.unreadMessage}>
                    <FaCircle className={styles.unreadDot} />
                    <p>{truncateText(conversation.last_message_content)}</p>
                  </div>
                ) : (
                  <p>{truncateText(conversation.last_message_content)}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;