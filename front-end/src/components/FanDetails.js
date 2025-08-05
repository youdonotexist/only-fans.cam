import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './FanDetails.module.css';
import LoginButton from './LoginButton';
import { getFanById } from '../network/fanApi.ts';
import { getMediaUrl } from '../network/mediaApi.ts';
import Sidebar from './Sidebar';
import PageLayout from './PageLayout';
import { FaSpinner, FaFan, FaHeart, FaComment, FaShare, FaUser } from 'react-icons/fa';

const FanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fan, setFan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFanDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const fanData = await getFanById(parseInt(id));
                setFan(fanData);
            } catch (err) {
                console.error('Error fetching fan details:', err);
                setError(err.message || 'Failed to load fan details');
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchFanDetails();
        }
    }, [id]);

    return (
        <div className={styles.container}>
            <Sidebar />
            
            <main className={styles.mainContent}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <FaSpinner className={styles.spinner} />
                        <p>Loading fan details...</p>
                    </div>
                ) : error ? (
                    <PageLayout showBackButton={true}>
                        <div className={styles.error}>
                            <p>{error}</p>
                        </div>
                    </PageLayout>
                ) : fan ? (
                    <PageLayout title={fan.title}>
                        <div className={styles.fanDetailsContainer}>
                            <div className={styles.userInfo}>
                                <img 
                                    src={fan.user_profile_image || "https://via.placeholder.com/40"} 
                                    alt={`${fan.username}'s avatar`} 
                                    className={styles.avatar}
                                    onClick={() => navigate(`/profile/${fan.user_id}`)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <span 
                                    onClick={() => navigate(`/profile/${fan.user_id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {fan.username || "Anonymous"}
                                </span>
                                <span className={styles.postDate}>
                                    {new Date(fan.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        
                            <div className={styles.fanContent}>
                                {fan.media && fan.media.length > 0 ? (
                                    <div className={styles.mediaContainer}>
                                        <img 
                                            src={getMediaUrl(fan.media[0].file_path)} 
                                            alt={fan.title} 
                                            className={styles.fanImage} 
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.noImagePlaceholder}>
                                        <FaFan size={60} />
                                        <p>No image available</p>
                                    </div>
                                )}
                                
                                <div className={styles.description}>
                                    <p>{fan.description || "No description provided."}</p>
                                </div>
                                
                                <div className={styles.stats}>
                                    <div><FaHeart /> {fan.likes_count || 0} Likes</div>
                                    <div><FaComment /> {fan.comments?.length || 0} Comments</div>
                                </div>
                            </div>
                            
                            {fan.comments && fan.comments.length > 0 && (
                                <div className={styles.commentsSection}>
                                    <h3>Comments</h3>
                                    {fan.comments.map(comment => (
                                        <div key={comment.id} className={styles.comment}>
                                            <img 
                                                src={comment.user_profile_image || "https://via.placeholder.com/30"} 
                                                alt={`${comment.username}'s avatar`} 
                                                className={styles.commentAvatar}
                                            />
                                            <div className={styles.commentContent}>
                                                <div className={styles.commentHeader}>
                                                    <span className={styles.commentUsername}>{comment.username}</span>
                                                    <span className={styles.commentDate}>
                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p>{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PageLayout>
                ) : (
                    <PageLayout showBackButton={true}>
                        <div className={styles.notFound}>
                            <h2>Fan not found</h2>
                        </div>
                    </PageLayout>
                )}
            </main>
        </div>
    );
};

export default FanDetails;
