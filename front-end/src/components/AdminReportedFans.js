import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminReportedFans.module.css';
import BackButton from './BackButton';

const AdminReportedFans = () => {
    const [reportedFans, setReportedFans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFan, setSelectedFan] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Check if user is admin
    useEffect(() => {
        if (!user || !user.is_admin) {
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch reported fans
    const fetchReportedFans = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/flagged-fans`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch reported fans');
            }
            
            const data = await response.json();
            setReportedFans(data);
        } catch (error) {
            console.error('Error fetching reported fans:', error);
            setError(error.message || 'Failed to fetch reported fans');
        } finally {
            setLoading(false);
        }
    };

    // Fetch reported fans on component mount
    useEffect(() => {
        fetchReportedFans();
    }, []);

    // Handle fan selection
    const handleSelectFan = async (id) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/flagged-fans/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch fan details');
            }
            
            const data = await response.json();
            setSelectedFan(data);
        } catch (error) {
            console.error('Error fetching fan details:', error);
            setError(error.message || 'Failed to fetch fan details');
        } finally {
            setLoading(false);
        }
    };

    // Handle fan status update
    const handleUpdateStatus = async (id, status) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/flagged-fans/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update fan status');
            }
            
            // Show success message
            setSuccess(`Fan ${status === 'approved' ? 'removed' : status} successfully`);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
            
            // Refresh the list and clear selected fan
            fetchReportedFans();
            setSelectedFan(null);
        } catch (error) {
            console.error('Error updating fan status:', error);
            setError(error.message || 'Failed to update fan status');
            
            // Clear error message after 3 seconds
            setTimeout(() => {
                setError('');
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <BackButton />
                <h1>Admin: Reported Fans</h1>
                <div className={styles.adminNav}>
                    <a href="/admin/feedback" className={styles.adminNavLink}>Feedback</a>
                    <a href="/admin/reported-fans" className={styles.adminNavLink}>Reported Fans</a>
                </div>
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            
            <div className={styles.content}>
                <div className={styles.reportsList}>
                    <h2>Reported Fans</h2>
                    {loading && !selectedFan ? (
                        <div className={styles.loading}>Loading...</div>
                    ) : reportedFans.length === 0 ? (
                        <div className={styles.noReports}>No reported fans found</div>
                    ) : (
                        <ul>
                            {reportedFans.map(fan => (
                                <li 
                                    key={fan.id} 
                                    className={`${styles.reportItem} ${selectedFan && selectedFan.id === fan.id ? styles.selected : ''}`}
                                    onClick={() => handleSelectFan(fan.id)}
                                >
                                    <div className={styles.reportTitle}>
                                        <span className={styles.fanTitle}>{fan.fan_title}</span>
                                        <span className={`${styles.status} ${styles[fan.status]}`}>{fan.status}</span>
                                    </div>
                                    <div className={styles.reportMeta}>
                                        <span>Reported by: {fan.reporter_username}</span>
                                        <span>Date: {formatDate(fan.created_at)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                <div className={styles.reportDetails}>
                    {selectedFan ? (
                        <div className={styles.fanDetails}>
                            <h2>Fan Details</h2>
                            <div className={styles.fanInfo}>
                                <h3>{selectedFan.fan_title}</h3>
                                <p className={styles.description}>{selectedFan.fan_description}</p>
                                
                                {selectedFan.fan_image_url && (
                                    <div className={styles.imageContainer}>
                                        <img 
                                            src={selectedFan.fan_image_url} 
                                            alt={selectedFan.fan_title} 
                                            className={styles.fanImage}
                                        />
                                    </div>
                                )}
                                
                                <div className={styles.reportInfo}>
                                    <h4>Report Information</h4>
                                    <p><strong>Reported by:</strong> {selectedFan.reporter_username}</p>
                                    <p><strong>Date:</strong> {formatDate(selectedFan.created_at)}</p>
                                    <p><strong>Reason:</strong> {selectedFan.reason}</p>
                                    <p><strong>Status:</strong> <span className={`${styles.status} ${styles[selectedFan.status]}`}>{selectedFan.status}</span></p>
                                </div>
                                
                                <div className={styles.actions}>
                                    <h4>Actions</h4>
                                    <div className={styles.actionButtons}>
                                        {selectedFan.status === 'pending' && (
                                            <>
                                                <button 
                                                    className={`${styles.actionButton} ${styles.approveButton}`}
                                                    onClick={() => handleUpdateStatus(selectedFan.id, 'approved')}
                                                    disabled={loading}
                                                >
                                                    Approve & Remove Fan
                                                </button>
                                                <button 
                                                    className={`${styles.actionButton} ${styles.rejectButton}`}
                                                    onClick={() => handleUpdateStatus(selectedFan.id, 'rejected')}
                                                    disabled={loading}
                                                >
                                                    Reject Report
                                                </button>
                                            </>
                                        )}
                                        <button 
                                            className={styles.actionButton}
                                            onClick={() => setSelectedFan(null)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noSelection}>
                            <p>Select a reported fan to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReportedFans;