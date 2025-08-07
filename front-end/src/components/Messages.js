import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaSearch, FaSpinner, FaList, FaArrowLeft } from 'react-icons/fa';
import styles from './Messages.module.css';
import Sidebar from './Sidebar';
import { getConversations, sendMessage } from '../network/messageApi.ts';
import { getUserById } from '../network/userApi.ts';
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
  const [showConversations, setShowConversations] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  // Handle URL query parameters for starting a new conversation
  useEffect(() => {
    const handleQueryParams = async () => {
      const searchParams = new URLSearchParams(location.search);
      const userId = searchParams.get('userId');
      const username = searchParams.get('username');
      
      if (userId) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('You must be logged in to send messages');
            return;
          }
          
          // Get user details if needed
          const user = { id: parseInt(userId), username };
          
          // Start a conversation with this user
          setStartingNewConversation(true);
          
          // Check if we already have a conversation with this user
          await fetchConversations();
          
          const currentUserId = parseInt(localStorage.getItem('userId'));
          const existingConversation = conversations.find(conv => 
            (conv.user1_id === currentUserId && conv.user2_id === parseInt(userId)) || 
            (conv.user2_id === currentUserId && conv.user1_id === parseInt(userId))
          );
          
          if (existingConversation) {
            // Select the existing conversation
            setSelectedConversation(existingConversation);
            setSelectedUserId(parseInt(userId));
          } else {
            // Start a new conversation
            await fetchConversations();
            setSelectedUserId(parseInt(userId));
            
            // Find the new conversation
            const newConversation = conversations.find(conv => 
              (conv.user1_id === currentUserId && conv.user2_id === parseInt(userId)) || 
              (conv.user2_id === currentUserId && conv.user1_id === parseInt(userId))
            );
            
            if (newConversation) {
              setSelectedConversation(newConversation);
            }
          }
          
          // Always keep the conversations list visible by default
          // (removed code that was hiding conversations on mobile)
          
          // Clear the URL parameters
          navigate('/messages', { replace: true });
          
        } catch (err) {
          console.error('Error starting conversation from URL params:', err);
          setError(err.message || 'Failed to start conversation');
        } finally {
          setStartingNewConversation(false);
        }
      }
    };
    
    handleQueryParams();
  }, [location.search, navigate, conversations]);

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
    
    // Keep the conversations panel visible even after selecting a conversation
    // This ensures users can easily switch between conversations
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