import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBug, FaComment, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import Sidebar from './Sidebar';
import styles from './FeedbackForm.module.css';

/**
 * FeedbackForm component for users to submit feedback or report bugs
 */
const FeedbackForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'feedback', // Default to feedback
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Get API URL from environment or use default
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      
      // Get token if user is logged in
      const token = localStorage.getItem('token');
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-auth-token'] = token;
      }
      
      // Submit feedback
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
      
      // Show success message
      setSuccess('Thank you for your feedback! We appreciate your input.');
      
      // Reset form
      setFormData({
        type: 'feedback',
        title: '',
        description: ''
      });
      
      // Redirect to home page after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your feedback');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Feedback & Bug Reports</h1>
          <p className={styles.subtitle}>
            We value your input! Please use this form to submit feedback or report bugs.
          </p>
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          
          {success && (
            <div className={styles.success}>
              {success}
            </div>
          )}
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Type</label>
              <div className={styles.typeSelector}>
                <button
                  type="button"
                  className={`${styles.typeButton} ${formData.type === 'feedback' ? styles.active : ''}`}
                  onClick={() => setFormData({ ...formData, type: 'feedback' })}
                >
                  <FaComment className={styles.typeIcon} /> Feedback
                </button>
                <button
                  type="button"
                  className={`${styles.typeButton} ${formData.type === 'bug' ? styles.active : ''}`}
                  onClick={() => setFormData({ ...formData, type: 'bug' })}
                >
                  <FaBug className={styles.typeIcon} /> Bug Report
                </button>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={formData.type === 'feedback' ? 'Feedback title' : 'Bug title'}
                className={styles.input}
                maxLength={100}
                required
              />
              <div className={styles.charCount}>
                {formData.title.length}/100
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={formData.type === 'feedback' 
                  ? 'Please describe your feedback in detail...' 
                  : 'Please describe the bug, including steps to reproduce it...'}
                className={styles.textarea}
                rows={6}
                maxLength={1000}
                required
              />
              <div className={styles.charCount}>
                {formData.description.length}/1000
              </div>
            </div>
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className={styles.spinner} /> Submitting...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Submit {formData.type === 'feedback' ? 'Feedback' : 'Bug Report'}
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default FeedbackForm;