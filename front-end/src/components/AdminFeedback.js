import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBug, FaComment, FaSpinner, FaFilter, FaCheck, FaHourglass, FaTools, FaTimes } from 'react-icons/fa';
import Sidebar from './Sidebar';
import styles from './AdminFeedback.module.css';

/**
 * AdminFeedback component for administrators to review feedback and bug reports
 * This page is only accessible to users with admin role
 */
const AdminFeedback = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Fetch feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Get API URL from environment or use default
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
        
        // Get token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('You must be logged in to access this page');
        }
        
        // Prepare query parameters for filtering
        let queryParams = '';
        if (statusFilter !== 'all') {
          queryParams += `status=${statusFilter}`;
        }
        if (typeFilter !== 'all') {
          queryParams += queryParams ? `&type=${typeFilter}` : `type=${typeFilter}`;
        }
        
        // Fetch feedback data
        const response = await fetch(`${API_URL}/feedback${queryParams ? '?' + queryParams : ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        });
        
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch feedback');
        }
        
        const data = await response.json();
        setFeedback(data.feedback || []);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching feedback');
        
        // If access denied, redirect to home page
        if (err.message.includes('Access denied')) {
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [navigate, statusFilter, typeFilter]);
  
  // Update feedback status
  const updateFeedbackStatus = async (id, status) => {
    setUpdatingStatus(true);
    
    try {
      // Get API URL from environment or use default
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to update feedback status');
      }
      
      // Update feedback status
      const response = await fetch(`${API_URL}/feedback/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update feedback status');
      }
      
      // Update local state
      setFeedback(prevFeedback => 
        prevFeedback.map(item => 
          item.id === id ? { ...item, status } : item
        )
      );
      
      // Update selected feedback if it's the one being updated
      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating feedback status');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaHourglass className={styles.pendingIcon} />;
      case 'in-progress':
        return <FaTools className={styles.inProgressIcon} />;
      case 'resolved':
        return <FaCheck className={styles.resolvedIcon} />;
      case 'rejected':
        return <FaTimes className={styles.rejectedIcon} />;
      default:
        return <FaHourglass className={styles.pendingIcon} />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Filter feedback by status and type
  const filteredFeedback = feedback.filter(item => {
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    const typeMatch = typeFilter === 'all' || item.type === typeFilter;
    return statusMatch && typeMatch;
  });
  
  return (
    <div className={styles.container}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        <div className={styles.adminHeader}>
          <h1 className={styles.title}>Admin Feedback Dashboard</h1>
          <p className={styles.subtitle}>
            Review and manage user feedback and bug reports
          </p>
        </div>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <div className={styles.filterContainer}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FaFilter className={styles.filterIcon} /> Status:
            </label>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FaFilter className={styles.filterIcon} /> Type:
            </label>
            <select 
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="feedback">Feedback</option>
              <option value="bug">Bug Reports</option>
            </select>
          </div>
        </div>
        
        <div className={styles.dashboardContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} />
              <p>Loading feedback...</p>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No feedback found matching the selected filters.</p>
            </div>
          ) : (
            <div className={styles.feedbackGrid}>
              <div className={styles.feedbackList}>
                {filteredFeedback.map(item => (
                  <div 
                    key={item.id} 
                    className={`${styles.feedbackItem} ${selectedFeedback && selectedFeedback.id === item.id ? styles.selected : ''}`}
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <div className={styles.feedbackHeader}>
                      <div className={styles.feedbackType}>
                        {item.type === 'feedback' ? (
                          <FaComment className={styles.feedbackIcon} />
                        ) : (
                          <FaBug className={styles.bugIcon} />
                        )}
                        <span>{item.type === 'feedback' ? 'Feedback' : 'Bug Report'}</span>
                      </div>
                      <div className={styles.feedbackStatus}>
                        {getStatusIcon(item.status)}
                        <span>{item.status}</span>
                      </div>
                    </div>
                    <h3 className={styles.feedbackTitle}>{item.title}</h3>
                    <div className={styles.feedbackMeta}>
                      <span className={styles.feedbackDate}>{formatDate(item.created_at)}</span>
                      <span className={styles.feedbackUser}>
                        {item.username ? `@${item.username}` : 'Anonymous'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.feedbackDetail}>
                {selectedFeedback ? (
                  <>
                    <div className={styles.detailHeader}>
                      <div className={styles.detailType}>
                        {selectedFeedback.type === 'feedback' ? (
                          <FaComment className={styles.feedbackIcon} />
                        ) : (
                          <FaBug className={styles.bugIcon} />
                        )}
                        <h2>{selectedFeedback.type === 'feedback' ? 'Feedback' : 'Bug Report'}</h2>
                      </div>
                      <div className={styles.detailStatus}>
                        {getStatusIcon(selectedFeedback.status)}
                        <span>{selectedFeedback.status}</span>
                      </div>
                    </div>
                    
                    <h3 className={styles.detailTitle}>{selectedFeedback.title}</h3>
                    
                    <div className={styles.detailMeta}>
                      <div className={styles.detailUser}>
                        <strong>Submitted by:</strong> {selectedFeedback.username ? `@${selectedFeedback.username}` : 'Anonymous'}
                        {selectedFeedback.email && <span className={styles.userEmail}>{selectedFeedback.email}</span>}
                      </div>
                      <div className={styles.detailDate}>
                        <strong>Date:</strong> {formatDate(selectedFeedback.created_at)}
                      </div>
                    </div>
                    
                    <div className={styles.detailDescription}>
                      <h4>Description:</h4>
                      <p>{selectedFeedback.description}</p>
                    </div>
                    
                    <div className={styles.statusActions}>
                      <h4>Update Status:</h4>
                      <div className={styles.statusButtons}>
                        <button 
                          className={`${styles.statusButton} ${styles.pendingButton} ${selectedFeedback.status === 'pending' ? styles.active : ''}`}
                          onClick={() => updateFeedbackStatus(selectedFeedback.id, 'pending')}
                          disabled={updatingStatus || selectedFeedback.status === 'pending'}
                        >
                          <FaHourglass /> Pending
                        </button>
                        <button 
                          className={`${styles.statusButton} ${styles.inProgressButton} ${selectedFeedback.status === 'in-progress' ? styles.active : ''}`}
                          onClick={() => updateFeedbackStatus(selectedFeedback.id, 'in-progress')}
                          disabled={updatingStatus || selectedFeedback.status === 'in-progress'}
                        >
                          <FaTools /> In Progress
                        </button>
                        <button 
                          className={`${styles.statusButton} ${styles.resolvedButton} ${selectedFeedback.status === 'resolved' ? styles.active : ''}`}
                          onClick={() => updateFeedbackStatus(selectedFeedback.id, 'resolved')}
                          disabled={updatingStatus || selectedFeedback.status === 'resolved'}
                        >
                          <FaCheck /> Resolved
                        </button>
                        <button 
                          className={`${styles.statusButton} ${styles.rejectedButton} ${selectedFeedback.status === 'rejected' ? styles.active : ''}`}
                          onClick={() => updateFeedbackStatus(selectedFeedback.id, 'rejected')}
                          disabled={updatingStatus || selectedFeedback.status === 'rejected'}
                        >
                          <FaTimes /> Rejected
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.noSelection}>
                    <p>Select a feedback item from the list to view details.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminFeedback;