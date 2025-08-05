import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './FanDetails.module.css';
import LoginButton from './LoginButton';
import { getFanById, likeFan, unlikeFan, addComment } from '../network/fanApi.ts';
import { getMediaUrl } from '../network/mediaApi.ts';
import Sidebar from './Sidebar';
import PageLayout from './PageLayout';
import { FaSpinner, FaFan, FaHeart, FaComment, FaShare, FaUser, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { useLoginModal } from '../contexts/LoginModalContext';

const FanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { openLoginModal } = useLoginModal();
    const [fan, setFan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        const fetchFanDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const fanData = await getFanById(parseInt(id));
                setFan(fanData);
                
                // Check if user has liked this fan
                const token = localStorage.getItem('token');
                if (token && fanData.is_liked) {
                    setIsLiked(fanData.is_liked);
                }
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
    
    // Handle like/unlike
    const handleLike = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Open login modal if not authenticated
            openLoginModal(window.location.pathname);
            return;
        }
        
        try {
            // Toggle like status
            const newLikedStatus = !isLiked;
            
            // Optimistically update UI
            setIsLiked(newLikedStatus);
            
            // Update fan likes count optimistically
            setFan(prev => {
                const newLikesCount = newLikedStatus 
                    ? (prev.likes_count || 0) + 1 
                    : (prev.likes_count || 1) - 1;
                return { ...prev, likes_count: newLikesCount };
            });
            
            // Call API to update like status
            if (newLikedStatus) {
                await likeFan(parseInt(id), token);
            } else {
                await unlikeFan(parseInt(id), token);
            }
        } catch (err) {
            console.error('Error toggling like:', err);
            // Revert optimistic update on error
            setIsLiked(prev => !prev);
            
            // Revert fan likes count
            setFan(prev => {
                const newLikesCount = isLiked
                    ? (prev.likes_count || 0) - 1 
                    : (prev.likes_count || 0) + 1;
                return { ...prev, likes_count: newLikesCount };
            });
        }
    };
    
    // Toggle comment form
    const toggleCommentForm = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Open login modal if not authenticated
            openLoginModal(window.location.pathname);
            return;
        }
        
        setShowCommentForm(prev => !prev);
        setCommentText('');
    };
    
    // Handle comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (!commentText.trim()) return;
        
        const token = localStorage.getItem('token');
        if (!token) {
            openLoginModal(window.location.pathname);
            return;
        }
        
        try {
            setSubmittingComment(true);
            
            // Create comment data
            const commentData = {
                content: commentText
            };
            
            // Add comment to the backend
            const newComment = await addComment(parseInt(id), commentData, token);
            
            // Update fan with new comment
            setFan(prev => {
                const updatedComments = prev.comments ? [...prev.comments, newComment] : [newComment];
                return {
                    ...prev,
                    comments: updatedComments
                };
            });
            
            // Clear comment text and hide form
            setCommentText('');
            setShowCommentForm(false);
        } catch (err) {
            console.error('Error adding comment:', err);
            alert('Failed to add comment. Please try again.');
        } finally {
            setSubmittingComment(false);
        }
    };

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
                                    <div 
                                        className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                                        onClick={handleLike}
                                    >
                                        <FaHeart /> {fan.likes_count || 0} Likes
                                    </div>
                                    <div 
                                        className={styles.commentButton}
                                        onClick={toggleCommentForm}
                                    >
                                        <FaComment /> {fan.comments?.length || 0} Comments
                                    </div>
                                    <div className={styles.shareButton}>
                                        <FaShare /> Share
                                    </div>
                                </div>
                                
                                {/* Comment Form */}
                                {showCommentForm && (
                                    <div className={styles.commentFormContainer}>
                                        <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
                                            <input
                                                type="text"
                                                placeholder="Add a comment..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                className={styles.commentInput}
                                                disabled={submittingComment}
                                            />
                                            <button 
                                                type="submit" 
                                                className={styles.commentSubmitButton}
                                                disabled={!commentText.trim() || submittingComment}
                                            >
                                                {submittingComment ? <FaSpinner className={styles.spinner} /> : <FaPaperPlane />}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                            
                            {/* Comments Section */}
                            {fan.comments && fan.comments.length > 0 && (
                                <div className={styles.commentsSection}>
                                    <h3>Comments</h3>
                                    {fan.comments.map(comment => (
                                        <div key={comment.id} className={styles.comment}>
                                            <img 
                                                src={comment.user_profile_image || "https://via.placeholder.com/30"} 
                                                alt={`${comment.username}'s avatar`} 
                                                className={styles.commentAvatar}
                                                onClick={() => navigate(`/profile/${comment.user_id}`)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <div className={styles.commentContent}>
                                                <div className={styles.commentHeader}>
                                                    <span 
                                                        className={styles.commentUsername}
                                                        onClick={() => navigate(`/profile/${comment.user_id}`)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {comment.username}
                                                    </span>
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
