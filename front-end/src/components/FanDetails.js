import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './FanDetails.module.css';
import LoginButton from './LoginButton';
import { getFanById, likeFan, unlikeFan, addComment, updateFan, deleteFan } from '../network/fanApi.ts';
import { getMediaUrl, uploadMedia, deleteMedia } from '../network/mediaApi.ts';
import Sidebar from './Sidebar';
import PageLayout from './PageLayout';
import { FaSpinner, FaFan, FaHeart, FaComment, FaShare, FaUser, FaPaperPlane, FaTimes, FaEllipsisV, FaEdit, FaTrash, FaImage, FaPlus, FaFlag } from 'react-icons/fa';
import { useLoginModal } from '../contexts/LoginModalContext';
import Avatar from './Avatar';

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
    
    // Image management state
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [showImageManager, setShowImageManager] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDeletingImage, setIsDeletingImage] = useState(false);
    const [imageError, setImageError] = useState('');
    const [imageSuccess, setImageSuccess] = useState('');
    const fileInputRef = useRef(null);

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
    
    // Handle report fan functionality
    const handleReportFan = () => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            // Open login modal if not authenticated
            openLoginModal(window.location.pathname);
            return;
        }
        
        // For now, just show a confirmation dialog and log the report
        if (window.confirm('Are you sure you want to report this fan?')) {
            // Here you would typically make an API call to report the fan
            // For now, we'll just log it and show a success message
            console.log('Reporting fan:', id);
            
            // Show success message
            alert('Fan reported successfully. Our team will review it.');
        }
    };
    
    // Toggle image manager
    const toggleImageManager = () => {
        if (!isCurrentUserAuthor) return;
        
        setShowImageManager(prev => !prev);
        
        // Reset state when closing
        if (showImageManager) {
            // Clean up preview URLs to avoid memory leaks
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);
            setSelectedFiles([]);
            setImageError('');
            setImageSuccess('');
        }
    };
    
    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // Validate files (only images)
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
            setImageError('Only image files are allowed');
            return;
        }
        
        // Create preview URLs for selected files
        const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
        
        setSelectedFiles(prev => [...prev, ...validFiles]);
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        setImageError('');
    };
    
    // Remove a selected file from preview
    const removeSelectedFile = (index) => {
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(previewUrls[index]);
        
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };
    
    // Upload selected images
    const handleImageUpload = async () => {
        if (selectedFiles.length === 0) {
            setImageError('Please select at least one image to upload');
            return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            openLoginModal(window.location.pathname);
            return;
        }
        
        try {
            setIsUploadingImage(true);
            setImageError('');
            
            // Upload images
            await uploadMedia(parseInt(id), selectedFiles, token);
            
            // Clear selected files and previews
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);
            setSelectedFiles([]);
            
            // Show success message
            setImageSuccess('Images uploaded successfully!');
            
            // Refresh fan data to show new images
            const updatedFan = await getFanById(parseInt(id));
            setFan(updatedFan);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setImageSuccess('');
            }, 3000);
        } catch (err) {
            console.error('Error uploading images:', err);
            setImageError(err.message || 'Failed to upload images. Please try again.');
        } finally {
            setIsUploadingImage(false);
        }
    };
    
    // Delete an existing image
    const handleImageDelete = async (mediaId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            openLoginModal(window.location.pathname);
            return;
        }
        
        try {
            setIsDeletingImage(true);
            setImageError('');
            
            // Delete the image
            await deleteMedia(mediaId, token);
            
            // Update fan state to remove the deleted image
            setFan(prev => ({
                ...prev,
                media: prev.media.filter(media => media.id !== mediaId)
            }));
            
            // Show success message
            setImageSuccess('Image deleted successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setImageSuccess('');
            }, 3000);
        } catch (err) {
            console.error('Error deleting image:', err);
            setImageError(err.message || 'Failed to delete image. Please try again.');
        } finally {
            setIsDeletingImage(false);
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
                                <Avatar 
                                    src={fan.user_profile_image} 
                                    alt={`${fan.username}'s avatar`} 
                                    username={fan.username}
                                    className={styles.avatar}
                                    size={40}
                                    onClick={() => navigate(`/user/${fan.username}`)}
                                />
                                <span 
                                    onClick={() => navigate(`/user/${fan.username}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {fan.username || "Anonymous"}
                                </span>
                                <span className={styles.postDate}>
                                    {new Date(fan.created_at).toLocaleDateString()}
                                </span>
                                
                                {/* Options menu for all posts */}
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
                                            {isCurrentUserAuthor ? (
                                                <>
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
                                                            setShowImageManager(true);
                                                            setShowOptionsMenu(false);
                                                        }}
                                                    >
                                                        <FaImage /> Manage Images
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
                                                </>
                                            ) : (
                                                // Show Report Fan option for posts not owned by current user
                                                <button 
                                                    className={styles.optionItem}
                                                    onClick={() => {
                                                        handleReportFan();
                                                        setShowOptionsMenu(false);
                                                    }}
                                                >
                                                    <FaFlag /> Report Fan
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        
                            <div className={styles.fanContent}>
                                {/* Image Manager */}
                                {showImageManager && isCurrentUserAuthor && (
                                    <div className={styles.imageManager}>
                                        <div className={styles.imageManagerHeader}>
                                            <h3>Manage Images</h3>
                                            <button 
                                                className={styles.closeButton}
                                                onClick={toggleImageManager}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                        
                                        {imageError && <div className={styles.error}>{imageError}</div>}
                                        {imageSuccess && <div className={styles.success}>{imageSuccess}</div>}
                                        
                                        {/* Current Images */}
                                        <div className={styles.currentImages}>
                                            <h4>Current Images</h4>
                                            {fan.media && fan.media.length > 0 ? (
                                                <div className={styles.imageGrid}>
                                                    {fan.media.map(media => (
                                                        <div key={media.id} className={styles.imageItem}>
                                                            <img 
                                                                src={getMediaUrl(media.file_path)} 
                                                                alt={fan.title} 
                                                                className={styles.thumbnailImage} 
                                                            />
                                                            <button
                                                                className={styles.deleteImageButton}
                                                                onClick={() => handleImageDelete(media.id)}
                                                                disabled={isDeletingImage}
                                                            >
                                                                <FaTrash /> Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={styles.noImages}>No images uploaded yet.</p>
                                            )}
                                        </div>
                                        
                                        {/* Upload New Images */}
                                        <div className={styles.uploadImages}>
                                            <h4>Upload New Images</h4>
                                            <div className={styles.uploadControls}>
                                                <div className={styles.uploadButton} onClick={() => fileInputRef.current.click()}>
                                                    <FaImage /> Select Images
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileSelect}
                                                    accept="image/*"
                                                    multiple
                                                    style={{ display: 'none' }}
                                                    disabled={isUploadingImage}
                                                />
                                                <button
                                                    className={styles.uploadSubmitButton}
                                                    onClick={handleImageUpload}
                                                    disabled={selectedFiles.length === 0 || isUploadingImage}
                                                >
                                                    {isUploadingImage ? (
                                                        <>
                                                            <FaSpinner className={styles.spinner} /> 
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaPlus /> Upload
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            
                                            {/* Image Previews */}
                                            {previewUrls.length > 0 && (
                                                <div className={styles.imagePreviewContainer}>
                                                    {previewUrls.map((url, index) => (
                                                        <div key={index} className={styles.imagePreview}>
                                                            <img src={url} alt={`Preview ${index + 1}`} />
                                                            <button
                                                                type="button"
                                                                className={styles.removeImageButton}
                                                                onClick={() => removeSelectedFile(index)}
                                                                disabled={isUploadingImage}
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Display images or placeholder */}
                                {fan.media && fan.media.length > 0 ? (
                                    <div className={styles.mediaContainer}>
                                        {/* Main image */}
                                        <img 
                                            src={getMediaUrl(fan.media[0].file_path)} 
                                            alt={fan.title} 
                                            className={styles.fanImage} 
                                        />
                                        
                                        {/* Image gallery for additional images */}
                                        {fan.media.length > 1 && (
                                            <div className={styles.imageGallery}>
                                                {fan.media.slice(1).map((media, index) => (
                                                    <div key={media.id} className={styles.galleryItem}>
                                                        <img 
                                                            src={getMediaUrl(media.file_path)} 
                                                            alt={`${fan.title} - image ${index + 2}`} 
                                                            className={styles.galleryImage} 
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                            <div className={styles.commentCharCount}>
                                                {commentText.length}/200
                                            </div>
                                            <div className={styles.inputButtonWrapper}>
                                                <input
                                                    type="text"
                                                    placeholder="Add a comment..."
                                                    value={commentText}
                                                    onChange={(e) => {
                                                        // Limit comment to 200 characters
                                                        if (e.target.value.length <= 200) {
                                                            setCommentText(e.target.value);
                                                        }
                                                    }}
                                                    maxLength={200}
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
                                            </div>
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
                                            <Avatar 
                                                src={comment.user_profile_image} 
                                                alt={`${comment.username}'s avatar`} 
                                                username={comment.username}
                                                className={styles.commentAvatar}
                                                size={30}
                                                onClick={() => navigate(`/user/${comment.username}`)}
                                            />
                                            <div className={styles.commentContent}>
                                                <div className={styles.commentHeader}>
                                                    <span 
                                                        className={styles.commentUsername}
                                                        onClick={() => navigate(`/user/${comment.username}`)}
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
