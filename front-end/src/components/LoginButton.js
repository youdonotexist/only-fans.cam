import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa';
import styles from './LoginButton.module.css';
import { useLoginModal } from '../contexts/LoginModalContext';

const LoginButton = ({ className }) => {
    const navigate = useNavigate();
    const { openLoginModal } = useLoginModal();
    
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('token') !== null;
    
    const handleClick = () => {
        if (isLoggedIn) {
            // If logged in, log out
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.reload(); // Reload to update UI
        } else {
            // If not logged in, open login modal
            openLoginModal();
        }
    };
    
    return (
        isLoggedIn ? <div/> :
        <button 
            className={`${styles.loginButton} ${className || ''}`}
            onClick={handleClick}
        >
            <FaSignInAlt className={styles.icon} />
            {isLoggedIn ? 'Logout' : 'Login'}
        </button>
    );
};

export default LoginButton;