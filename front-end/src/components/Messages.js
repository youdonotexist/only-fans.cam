import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaSearch, FaSpinner } from 'react-icons/fa';
import styles from './Messages.module.css';
import Sidebar from './Sidebar';
import { getConversations } from '../network/messageApi.ts';
import MessageList from './MessageList';
import MessageDetail from './MessageDetail';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to view messages');
        setLoading(false);
        return;
      }
      
      const response = await getConversations(token);
      setConversations(response.conversations || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    
    // Determine which user ID to use (the one that's not the current user)
    const currentUserId = parseInt(localStorage.getItem('userId'));
    const otherUserId = conversation.user1_id === currentUserId 
      ? conversation.user2_id 
      : conversation.user1_id;
    
    setSelectedUserId(otherUserId);
  };

  const handleNewMessage = () => {
    // This would typically open a modal or navigate to a new message form
    // For now, we'll just log a message
    console.log('New message button clicked');
  };

  const filteredConversations = conversations.filter(conversation => {
    const currentUserId = parseInt(localStorage.getItem('userId'));
    const otherUserName = conversation.user1_id === currentUserId 
      ? conversation.user2_username 
      : conversation.user1_username;
    
    return otherUserName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className={styles.container}>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.messagesContainer}>
          {/* Left Panel - Conversation List */}
          <div className={styles.conversationsPanel}>
            <div className={styles.conversationsHeader}>
              <h2><FaEnvelope /> Messages</h2>
              <button 
                className={styles.newMessageBtn}
                onClick={handleNewMessage}
              >
                New Message
              </button>
            </div>
            
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            {loading ? (
              <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} />
                <p>Loading conversations...</p>
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
              </div>
            ) : (
              <MessageList 
                conversations={filteredConversations}
                onSelectConversation={handleConversationSelect}
                selectedConversationId={selectedConversation?.id}
              />
            )}
          </div>
          
          {/* Right Panel - Message Detail */}
          <div className={styles.messageDetailPanel}>
            {selectedUserId ? (
              <MessageDetail 
                userId={selectedUserId}
                onMessageSent={fetchConversations}
              />
            ) : (
              <div className={styles.noConversationSelected}>
                <FaEnvelope className={styles.noConversationIcon} />
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list or start a new one.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;