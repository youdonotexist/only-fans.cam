import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './FanDetails.module.css';
import LoginButton from './LoginButton';
import { getFanById, likeFan, unlikeFan, addComment, updateFan, deleteFan } from '../network/fanApi.ts';
import { getMediaUrl } from '../network/mediaApi.ts';
import Sidebar from './Sidebar';
import PageLayout from './PageLayout';
import { FaSpinner, FaFan, FaHeart, FaComment, FaShare, FaUser, FaPaperPlane, FaTimes, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
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
    const [isCurrentUserAuthor, setIsCurrentUserAuthor] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                
                // Check if current user is the author of the post
                const currentUserId = localStorage.getItem('userId');
                if (currentUserId && fanData.user_id === parseInt(currentUserId)) {
                    setIsCurrentUserAuthor(true);
                    setEditTitle(fanData.title || '');
                    setEditDescription(fanData.description || '');
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
    
    // Handle post update
    const handleUpdatePost = async () => {
        if (!editTitle.trim()) return;
        
        const token = localStorage.getItem('token');
        if (!token) {
            openLoginModal(window.location.pathname);
            return;
        }
        
        try {
            setIsSubmitting(true);
            
            // Create update data
            const updateData = {
                title: editTitle,
                description: editDescription.trim() ? editDescription : undefined
            };
            
            // Update fan in the backend
            const updatedFan = await updateFan(parseInt(id), updateData, token);
            
            // Update fan in state
            setFan(prev => ({
                ...prev,
                title: updatedFan.title,
                description: updatedFan.description
            }));
            
            // Exit edit mode
            setIsEditing(false);
            
            // Show success message
            alert('Post updated successfully!');
        } catch (err) {
            console.error('Error updating post:', err);
            alert('Failed to update post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handle post deletion
    const handleDeletePost = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            openLoginModal(window.location.pathname);
            return;
        }
        
        try {
            setIsSubmitting(true);
            
            // Delete fan in the backend
            await deleteFan(parseInt(id), token);
            
            // Show success message
            alert('Post deleted successfully!');
            
            // Navigate back to home page
            navigate('/');
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Failed to delete post. Please try again.');
        } finally {
            setIsSubmitting(false);
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
                                
                                {/* Options menu for post author */}
                                {isCurrentUserAuthor && (
                                    <div className={styles.optionsContainer}>
                                        <button 
                                            className={styles.optionsButton}
                                            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                                            aria-label="Post options"
                                        >
                                            <FaEllipsisV />
                                        </button>
                                        
                                        {showOptionsMenu && (
                                            <div className={styles.optionsMenu}>
                                                <button 
                                                    className={styles.optionItem}
                                                    onClick={() => {
                                                        setIsEditing(true);
                                                        setShowOptionsMenu(false);
                                                    }}
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                                <button 
                                                    className={styles.optionItem}
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this post?')) {
                                                            handleDeletePost();
                                                        }
                                                        setShowOptionsMenu(false);
                                                    }}
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                
                                {isEditing ? (
                                    <div className={styles.editForm}>
                                        <h3>Edit Post</h3>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="editTitle">Title</label>
                                            <input
                                                id="editTitle"
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className={styles.editInput}
                                                placeholder="Enter title"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="editDescription">Description</label>
                                            <textarea
                                                id="editDescription"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                className={styles.editTextarea}
                                                placeholder="Enter description"
                                                rows={4}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className={styles.editButtons}>
                                            <button
                                                className={styles.cancelButton}
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditTitle(fan.title || '');
                                                    setEditDescription(fan.description || '');
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className={styles.saveButton}
                                                onClick={handleUpdatePost}
                                                disabled={!editTitle.trim() || isSubmitting}
                                            >
                                                {isSubmitting ? <FaSpinner className={styles.spinner} /> : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.description}>
                                        <p>{fan.description || "No description provided."}</p>
                                    </div>
                                )}
                                
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
