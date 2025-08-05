import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { login, register } from '../network';
import { getCurrentUser } from '../network/userApi.ts';
import styles from './LoginModal.module.css';

const LoginModal = ({ onClose, redirectPath }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  // Handle login form input changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };
  
  // Handle register form input changes
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value
    });
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate form
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

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

      setSuccess('Login successful!');

      // Close modal and redirect if needed
      setTimeout(() => {
        if (onClose) onClose();
        
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          // Reload the current page to reflect logged-in state
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle register form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate form
    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Call register API
      const response = await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });

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

      setSuccess('Registration successful!');

      // Close modal and redirect if needed
      setTimeout(() => {
        if (onClose) onClose();
        
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          // Reload the current page to reflect logged-in state
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{activeTab === 'login' ? 'Login' : 'Register'}</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.tabContainer}>
            <div 
              className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('login')}
            >
              Login
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'register' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('register')}
            >
              Register
            </div>
          </div>
          
          {activeTab === 'login' ? (
            <>
              <p className={styles.modalMessage}>
                Please log in to access this content
              </p>
              
              <form onSubmit={handleLoginSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FaEnvelope className={styles.inputIcon} />
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
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
                      onChange={handleLoginChange}
                      placeholder="Password"
                      className={styles.input}
                      required
                    />
                  </label>
                </div>
                
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}
                
                <button 
                  type="submit" 
                  className={styles.loginButton}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className={styles.modalMessage}>
                Create a new account
              </p>
              
              <form onSubmit={handleRegisterSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FaUser className={styles.inputIcon} />
                    <input
                      type="text"
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      placeholder="Username"
                      className={styles.input}
                      required
                    />
                  </label>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FaEnvelope className={styles.inputIcon} />
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
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
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Password"
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
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Confirm Password"
                      className={styles.input}
                      required
                    />
                  </label>
                </div>
                
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}
                
                <button 
                  type="submit" 
                  className={styles.loginButton}
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;