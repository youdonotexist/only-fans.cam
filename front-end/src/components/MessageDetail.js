import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import styles from './MessageDetail.module.css';
import { getMessages, sendMessage } from '../network/messageApi.ts';

const MessageDetail = ({ userId, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // Set up polling for new messages every 10 seconds
    const intervalId = setInterval(fetchMessages, 10000);
    
    return () => clearInterval(intervalId);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to view messages');
        setLoading(false);
        return;
      }
      
      const response = await getMessages(userId, token);
      
      // Sort messages by created_at in ascending order
      const sortedMessages = [...response.messages].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      
      setMessages(sortedMessages);
      
      // Set other user info from the first message
      if (sortedMessages.length > 0) {
        const currentUserId = parseInt(localStorage.getItem('userId'));
        const firstMessage = sortedMessages[0];
        
        if (firstMessage.sender_id === currentUserId) {
          setOtherUser({
            id: firstMessage.recipient_id,
            username: firstMessage.recipient_username,
            profileImage: firstMessage.recipient_profile_image
          });
        } else {
          setOtherUser({
            id: firstMessage.sender_id,
            username: firstMessage.sender_username,
            profileImage: firstMessage.sender_profile_image
          });
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to send messages');
        setSending(false);
        return;
      }
      
      await sendMessage(userId, newMessage, token);
      setNewMessage('');
      
      // Fetch updated messages
      await fetchMessages();
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent();
      }
      
      setSending(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  if (loading && messages.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading messages...</p>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();
  const currentUserId = parseInt(localStorage.getItem('userId'));

  return (
    <div className={styles.messageDetail}>
      {/* Header */}
      {otherUser && (
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <img 
              src={otherUser.profileImage || "https://via.placeholder.com/40"}
              alt={otherUser.username}
              className={styles.avatar}
            />
            <h3>{otherUser.username}</h3>
          </div>
        </div>
      )}
      
      {/* Message List */}
      <div className={styles.messageList} ref={messageListRef}>
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date} className={styles.messageGroup}>
            <div className={styles.dateDivider}>
              <span>{formatDate(date)}</span>
            </div>
            
            {msgs.map(message => (
              <div 
                key={message.id}
                className={`${styles.message} ${
                  message.sender_id === currentUserId ? styles.sent : styles.received
                }`}
              >
                <div className={styles.messageContent}>
                  <p>{message.content}</p>
                  <span className={styles.messageTime}>
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form className={styles.messageForm} onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.messageInput}
          disabled={sending}
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? <FaSpinner className={styles.spinner} /> : <FaPaperPlane />}
        </button>
      </form>
      
      {error && (
        <div className={styles.formError}>
          {error}
        </div>
      )}
    </div>
  );
};

export default MessageDetail;