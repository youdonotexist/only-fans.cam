import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import { register, login } from '../network';
import { getCurrentUser } from '../network/userApi.ts';
import BackButton from './BackButton';

const Auth = () => {
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

            setSuccess('Login successful! Redirecting...');

            // Redirect to home page after a short delay
            setTimeout(() => {
                navigate('/');
            }, 1500);
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

            setSuccess('Registration successful! Redirecting...');

            // Redirect to home page after a short delay
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.backButtonContainer}>
                <BackButton />
            </div>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <div className={styles.logo}>OnlyFans</div>
                    <p>Your one-stop shop for all types of fans!</p>
                </div>

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
                    <form onSubmit={handleLoginSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={styles.input}
                                value={loginData.email}
                                onChange={handleLoginChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={styles.input}
                                value={loginData.password}
                                onChange={handleLoginChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>{success}</div>}

                        <button 
                            type="submit" 
                            className={styles.button}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className={styles.input}
                                value={registerData.username}
                                onChange={handleRegisterChange}
                                placeholder="Choose a username"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="registerEmail">Email</label>
                            <input
                                type="email"
                                id="registerEmail"
                                name="email"
                                className={styles.input}
                                value={registerData.email}
                                onChange={handleRegisterChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="registerPassword">Password</label>
                            <input
                                type="password"
                                id="registerPassword"
                                name="password"
                                className={styles.input}
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className={styles.input}
                                value={registerData.confirmPassword}
                                onChange={handleRegisterChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>{success}</div>}

                        <button 
                            type="submit" 
                            className={styles.button}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Auth;
