import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import styles from './NewMessageModal.module.css';
import { searchUsers } from '../network/userApi.ts';
import Avatar from './Avatar';

const NewMessageModal = ({ onClose, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Search users when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const users = await searchUsers(debouncedSearchTerm);
        
        // Filter out current user
        const currentUserId = parseInt(localStorage.getItem('userId'));
        const filteredUsers = users.filter(user => user.id !== currentUserId);
        
        setSearchResults(filteredUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error searching users:', err);
        setError(err.message || 'Failed to search users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearchTerm]);

  const handleSelectUser = (user) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>New Message</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search for users by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
        </div>
        
        <div className={styles.resultsContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} />
              <p>Searching users...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className={styles.noResults}>
              {debouncedSearchTerm.trim().length >= 2 ? (
                <p>No users found matching "{debouncedSearchTerm}"</p>
              ) : (
                <p>Type at least 2 characters to search</p>
              )}
            </div>
          ) : (
            <ul className={styles.userList}>
              {searchResults.map(user => (
                <li 
                  key={user.id} 
                  className={styles.userItem}
                  onClick={() => handleSelectUser(user)}
                >
                  <Avatar 
                    src={user.profile_image} 
                    alt={user.username}
                    username={user.username}
                    className={styles.userAvatar}
                    size={40}
                  />
                  <div className={styles.userInfo}>
                    <h4 className={styles.userName}>@{user.username}</h4>
                    {user.bio && <p className={styles.userBio}>{user.bio.substring(0, 60)}{user.bio.length > 60 ? '...' : ''}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;