import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaSearch, FaSpinner, FaList, FaArrowLeft } from 'react-icons/fa';
import styles from './Messages.module.css';
import Sidebar from './Sidebar';
import { getConversations, sendMessage } from '../network/messageApi.ts';
import MessageList from './MessageList';
import MessageDetail from './MessageDetail';
import NewMessageModal from './NewMessageModal';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [startingNewConversation, setStartingNewConversation] = useState(false);
  const [showConversations, setShowConversations] = useState(window.innerWidth > 768);
  const navigate = useNavigate();
  
  // Check window size on resize to update showConversations state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowConversations(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    
    // On mobile, hide the conversations panel after selecting a conversation
    if (window.innerWidth <= 768) {
      setShowConversations(false);
    }
  };
  
  // Toggle conversations panel visibility on mobile
  const toggleConversations = () => {
    setShowConversations(prev => !prev);
  };

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
  };
  
  const handleSelectUser = async (user) => {
    try {
      setStartingNewConversation(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to send messages');
        setStartingNewConversation(false);
        return;
      }
      
      // Send an initial message to start the conversation
      await sendMessage(user.id, "Hi there!", token);
      
      // Refresh conversations list
      await fetchConversations();
      
      // Select the new conversation with this user
      setSelectedUserId(user.id);
      
      // Find the conversation in the updated list
      const currentUserId = parseInt(localStorage.getItem('userId'));
      const newConversation = conversations.find(conv => 
        (conv.user1_id === currentUserId && conv.user2_id === user.id) || 
        (conv.user2_id === currentUserId && conv.user1_id === user.id)
      );
      
      if (newConversation) {
        setSelectedConversation(newConversation);
      }
      
      setStartingNewConversation(false);
    } catch (err) {
      console.error('Error starting new conversation:', err);
      setError(err.message || 'Failed to start conversation');
      setStartingNewConversation(false);
    }
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
          {/* Toggle button for mobile */}
          <button 
            className={styles.toggleConversations}
            onClick={toggleConversations}
            aria-label={showConversations ? "Hide conversations" : "Show conversations"}
          >
            {showConversations ? <FaArrowLeft /> : <FaList />}
          </button>
          
          {/* Left Panel - Conversation List */}
          <div className={`${styles.conversationsPanel} ${showConversations ? styles.visible : ''}`}>
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
          <div className={`${styles.messageDetailPanel} ${!showConversations ? styles.fullWidth : ''}`}>
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
      
      {/* New Message Modal */}
      {showNewMessageModal && (
        <NewMessageModal 
          onClose={() => setShowNewMessageModal(false)}
          onSelectUser={handleSelectUser}
        />
      )}
      
      {/* Loading overlay when starting a new conversation */}
      {startingNewConversation && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <FaSpinner className={styles.spinner} />
            <p>Starting conversation...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;