import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUser, FaLock } from 'react-icons/fa';
import { login } from '../network';
import { getCurrentUser } from '../network/userApi.ts';
import styles from './LoginModal.module.css';

const LoginModal = ({ onClose, redirectPath }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call login API
      const response = await login(loginData.email, loginData.password);

      // Store token in localStorage
      localStorage.setItem('token', response.token);

      // Fetch user data using the token
      try {
        const userData = await getCurrentUser(response.token);
        
        // Store user ID in localStorage
        localStorage.setItem('userId', userData.id);
      } catch (userError) {
        console.error('Error fetching user data:', userError);
        // Continue even if fetching user data fails
      }

      // Close modal and redirect if needed
      if (onClose) onClose();
      
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        // Reload the current page to reflect logged-in state
        window.location.reload();
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/auth');
    if (onClose) onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Login Required</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>
            Please log in to access this content
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FaUser className={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={styles.input}
                  required
                />
              </label>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FaLock className={styles.inputIcon} />
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={styles.input}
                  required
                />
              </label>
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className={styles.registerPrompt}>
            <span>Don't have an account?</span>
            <button 
              className={styles.registerButton}
              onClick={handleRegisterClick}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;