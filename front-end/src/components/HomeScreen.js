import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaComment, FaShare, FaPlus, FaImage, FaSpinner, FaTimes, FaFan, FaPaperPlane, FaEllipsisV, FaEdit, FaImages, FaFlag } from 'react-icons/fa';
import layoutStyles from './Layout.module.css';
import createPostStyles from './CreatePost.module.css';
import fanPostStyles from './FanPost.module.css';
import commentStyles from './Comments.module.css';
import animationStyles from './Animations.module.css';
import uiStyles from './UI.module.css';
import Sidebar from "./Sidebar";
import { createFan, getAllFans, likeFan, unlikeFan, getFanById, addComment } from '../network/fanApi.ts';
import { uploadMedia } from '../network/mediaApi.ts';
import { getMediaUrl } from '../network/mediaApi.ts';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoginModal } from '../contexts/LoginModalContext';
import { useAuth } from '../contexts/AuthContext';
import Avatar from "./Avatar";

const HomeScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { openLoginModal } = useLoginModal();
    const { currentUser } = useAuth();
    
    // State for fans from backend
    const [fans, setFans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [likedFans, setLikedFans] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    // State for comments
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [currentFanId, setCurrentFanId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    
    // State for new post form
    const [showPostForm, setShowPostForm] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        description: '',
        fan_type: 'ceiling'
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);
    
    // State for fan media
    const [fanMedia, setFanMedia] = useState({});
    
    // State for post options menu
    const [activeOptionsMenu, setActiveOptionsMenu] = useState(null);
    
    // Click outside handler for options menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeOptionsMenu && !event.target.closest(`.${fanPostStyles.optionsMenuContainer}`)) {
                setActiveOptionsMenu(null);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activeOptionsMenu, fanPostStyles.optionsMenuContainer]);
    
    // Check for URL parameter to open post form
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('newPost') === 'true') {
            // Check if user is logged in
            const token = localStorage.getItem('token');
            if (token) {
                setShowPostForm(true);
                // Remove the parameter from URL to avoid reopening form on refresh
                navigate('/', { replace: true });
            } else {
                // If not logged in, redirect to login
                openLoginModal('/');
            }
        }
    }, [location, navigate, openLoginModal]);
    
    // Fetch initial fans from backend
    useEffect(() => {
        const fetchInitialFans = async () => {
            try {
                setLoading(true);
                setLoadError('');
                setPage(1); // Reset to page 1
                
                const response = await getAllFans(1, 10);
                setFans(response.fans || []);
                
                // Check if there are more fans to load
                setHasMore(response.pagination.page < response.pagination.totalPages);
                
                // Initialize liked status based on likes_count
                const initialLikedState = {};
                response.fans?.forEach(fan => {
                    initialLikedState[fan.id] = false; // Initially set all to unliked
                });
                setLikedFans(initialLikedState);
                
                // Fetch media for each fan with media_count > 0
                const mediaPromises = response.fans
                    .filter(fan => fan.media_count > 0)
                    .map(async (fan) => {
                        try {
                            const fanDetails = await getFanById(fan.id);
                            return { fanId: fan.id, media: fanDetails.media };
                        } catch (err) {
                            console.error(`Error fetching media for fan ${fan.id}:`, err);
                            return { fanId: fan.id, media: [] };
                        }
                    });
                
                const mediaResults = await Promise.all(mediaPromises);
                const mediaMap = {};
                mediaResults.forEach(result => {
                    if (result.media && result.media.length > 0) {
                        mediaMap[result.fanId] = result.media[0]; // Use the first media item
                    }
                });
                
                setFanMedia(mediaMap);
            } catch (err) {
                console.error('Error fetching fans:', err);
                setLoadError(err.message || 'Failed to load fans');
            } finally {
                setLoading(false);
            }
        };
        
        fetchInitialFans();
    }, [success]); // Refetch when a new post is created successfully
    
    // Handle like/unlike
    const handleLike = async (fanId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Open login modal if not authenticated
            openLoginModal(window.location.pathname);
            return;
        }
        
        try {
            // Toggle like status
            const isCurrentlyLiked = likedFans[fanId];
            
            // Optimistically update UI
            setLikedFans(prev => ({
                ...prev,
                [fanId]: !isCurrentlyLiked
            }));
            
            // Update fan likes count optimistically
            setFans(prev => 
                prev.map(fan => {
                    if (fan.id === fanId) {
                        const newLikesCount = isCurrentlyLiked 
                            ? (fan.likes_count || 1) - 1 
                            : (fan.likes_count || 0) + 1;
                        return { ...fan, likes_count: newLikesCount };
                    }
                    return fan;
                })
            );
            
            // Call API to update like status
            if (isCurrentlyLiked) {
                await unlikeFan(fanId, token);
            } else {
                await likeFan(fanId, token);
            }
        } catch (err) {
            console.error('Error toggling like:', err);
            // Revert optimistic update on error
            setLikedFans(prev => ({
                ...prev,
                [fanId]: !prev[fanId]
            }));
            
            // Revert fan likes count
            setFans(prev => 
                prev.map(fan => {
                    if (fan.id === fanId) {
                        const newLikesCount = likedFans[fanId]
                            ? (fan.likes_count || 0) + 1 
                            : (fan.likes_count || 1) - 1;
                        return { ...fan, likes_count: newLikesCount };
                    }
                    return fan;
                })
            );
        }
    };
    
    // Handle opening comment modal
    const handleCommentClick = async (fanId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Open login modal if not authenticated
            openLoginModal(window.location.pathname);
            return;
        }
        
        setCurrentFanId(fanId);
        setCommentText('');
        setLoadingComments(true);
        setShowCommentModal(true);
        
        try {
            // Fetch fan details including comments
            const fanDetails = await getFanById(fanId);
            setComments(fanDetails.comments || []);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setComments([]);
        } finally {
            setLoadingComments(false);
        }
    };
    
    // Handle submitting a new comment
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (!commentText.trim()) return;
        
        const token = localStorage.getItem('token');
        if (!token || !currentFanId) return;
        
        try {
            // Create comment data
            const commentData = {
                content: commentText
            };
            
            // Add comment to the backend
            const newComment = await addComment(currentFanId, commentData, token);
            
            // Update comments list
            setComments(prev => [...prev, newComment]);
            
            // Clear comment text
            setCommentText('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment. Please try again.');
        }
    };
    
    // Close comment modal
    const closeCommentModal = () => {
        setShowCommentModal(false);
        setCurrentFanId(null);
        setComments([]);
    };
    
    // Load more fans when scrolling
    const loadMoreFans = async () => {
        if (!hasMore || loadingMore) return;
        
        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const response = await getAllFans(nextPage, 10);
            
            if (response.fans && response.fans.length > 0) {
                // Add new fans to the existing list
                setFans(prevFans => [...prevFans, ...response.fans]);
                setPage(nextPage);
                
                // Update hasMore flag
                setHasMore(response.pagination.page < response.pagination.totalPages);
                
                // Initialize liked status for new fans
                const newLikedState = { ...likedFans };
                response.fans.forEach(fan => {
                    newLikedState[fan.id] = false;
                });
                setLikedFans(newLikedState);
                
                // Fetch media for new fans with media_count > 0
                const mediaPromises = response.fans
                    .filter(fan => fan.media_count > 0)
                    .map(async (fan) => {
                        try {
                            const fanDetails = await getFanById(fan.id);
                            return { fanId: fan.id, media: fanDetails.media };
                        } catch (err) {
                            console.error(`Error fetching media for fan ${fan.id}:`, err);
                            return { fanId: fan.id, media: [] };
                        }
                    });
                
                const mediaResults = await Promise.all(mediaPromises);
                const newMediaMap = { ...fanMedia };
                mediaResults.forEach(result => {
                    if (result.media && result.media.length > 0) {
                        newMediaMap[result.fanId] = result.media[0];
                    }
                });
                
                setFanMedia(newMediaMap);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error loading more fans:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    // Handle scroll event to load more fans
    useEffect(() => {
        const handleScroll = () => {
            // Check if user has scrolled to the bottom of the page
            if (
                window.innerHeight + document.documentElement.scrollTop >= 
                document.documentElement.offsetHeight - 300 // Load more when 300px from bottom
            ) {
                loadMoreFans();
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, hasMore, loadingMore]); // Re-attach listener when these dependencies change
    
    // Handle report fan functionality
    const handleReportFan = async (fanId) => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            // Open login modal if not authenticated
            openLoginModal(window.location.pathname);
            return;
        }
        
        // Show confirmation dialog
        if (window.confirm('Are you sure you want to report this fan?')) {
            try {
                // Get reason from user
                const reason = prompt('Please provide a reason for reporting this fan:');
                if (!reason) {
                    return; // User cancelled or provided empty reason
                }
                
                // Make API call to report the fan
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/flagged-fans`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        fan_id: fanId,
                        reason: reason
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to report fan');
                }
                
                // Show success message
                const tempSuccess = 'Fan reported successfully. Our team will review it.';
                setSuccess(tempSuccess);
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    if (success === tempSuccess) {
                        setSuccess('');
                    }
                }, 3000);
            } catch (error) {
                console.error('Error reporting fan:', error);
                setError(error.message || 'Failed to report fan');
                
                // Clear error message after 3 seconds
                setTimeout(() => {
                    setError('');
                }, 3000);
            }
        }
    };
    
    // Handle share functionality
    const handleShare = (fan) => {
        // Create share URL
        const shareUrl = `${window.location.origin}/fan/${fan.id}`;
        
        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: fan.title,
                text: fan.description || 'Check out this fan!',
                url: shareUrl,
            })
            .then(() => console.log('Shared successfully'))
            .catch((error) => console.error('Error sharing:', error));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    // Show temporary success message
                    const tempSuccess = 'Link copied to clipboard!';
                    setSuccess(tempSuccess);
                    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        if (success === tempSuccess) {
                            setSuccess('');
                        }
                    }, 3000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    alert('Failed to copy link. Please copy this URL manually: ' + shareUrl);
                });
        }
    };
    
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Apply character limits
        if (name === 'title' && value.length > 100) {
            return; // Limit title to 100 characters
        }
        
        if (name === 'description' && value.length > 500) {
            return; // Limit description to 500 characters
        }
        
        setNewPost(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // Validate files (only images)
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
            setError('Only image files are allowed');
            return;
        }
        
        // Create preview URLs for selected files
        const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
        
        setSelectedFiles(prev => [...prev, ...validFiles]);
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    };
    
    // Remove a selected file
    const removeFile = (index) => {
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(previewUrls[index]);
        
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!newPost.title.trim()) {
            setError('Title is required');
            return;
        }
        
        try {
            setIsSubmitting(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to create a post');
                setIsSubmitting(false);
                return;
            }
            
            // Create fan post
            const createdFan = await createFan(newPost, token);
            
            // Upload images if any are selected
            if (selectedFiles.length > 0) {
                try {
                    await uploadMedia(parseInt(createdFan.id), selectedFiles, token);
                } catch (uploadError) {
                    console.error('Error uploading images:', uploadError);
                    setError(`Post created but failed to upload images: ${uploadError.message}`);
                    setIsSubmitting(false);
                    return;
                }
            }
            
            // Reset form
            setNewPost({
                title: '',
                description: '',
                fan_type: 'ceiling'
            });
            setSelectedFiles([]);
            
            // Revoke all object URLs to avoid memory leaks
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);
            
            setShowPostForm(false);
            setSuccess('Post created successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
            
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.message || 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className={layoutStyles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={layoutStyles.mainContent}>
                {/* Create Post Section */}
                <div className={createPostStyles.createPostSection}>
                    {!showPostForm ? (
                        <button 
                            className={createPostStyles.createPostButton}
                            onClick={() => setShowPostForm(true)}
                        >
                            <FaPlus /> Create New Post
                        </button>
                    ) : (
                        <div className={createPostStyles.createPostForm}>
                            <h3>Create New Fan Post</h3>
                            {error && <div className={uiStyles.error}>{error}</div>}
                            {success && <div className={uiStyles.success}>{success}</div>}
                            
                            <form onSubmit={handleSubmit}>
                                <div className={uiStyles.formGroup}>
                                    <label htmlFor="title">Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={newPost.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter fan title"
                                        maxLength={100}
                                        disabled={isSubmitting}
                                        className={uiStyles.input}
                                    />
                                    <div className={uiStyles.charCount}>
                                        {newPost.title.length}/100 characters
                                    </div>
                                </div>
                                
                                <div className={uiStyles.formGroup}>
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={newPost.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe your fan"
                                        maxLength={500}
                                        rows={3}
                                        disabled={isSubmitting}
                                        className={uiStyles.textarea}
                                    />
                                    <div className={uiStyles.charCount}>
                                        {newPost.description.length}/500 characters
                                    </div>
                                </div>
                                
                                <div className={uiStyles.formGroup}>
                                    <label htmlFor="fan_type">Fan Type</label>
                                    <select
                                        id="fan_type"
                                        name="fan_type"
                                        value={newPost.fan_type}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className={uiStyles.input}
                                    >
                                        <option value="ceiling">Ceiling Fan</option>
                                        <option value="table">Table Fan</option>
                                        <option value="tower">Tower Fan</option>
                                        <option value="box">Box Fan</option>
                                        <option value="industrial">Industrial Fan</option>
                                        <option value="bladeless">Bladeless Fan</option>
                                        <option value="hand">Hand Fan</option>
                                        <option value="computer">Computer Cooling Fan</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                <div className={uiStyles.formGroup}>
                                    <label>
                                        <div className={createPostStyles.uploadButton} onClick={() => fileInputRef.current.click()}>
                                            <FaImage /> Add Photos
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/*"
                                            multiple
                                            style={{ display: 'none' }}
                                            disabled={isSubmitting}
                                        />
                                    </label>
                                    
                                    {previewUrls.length > 0 && (
                                        <div className={createPostStyles.imagePreviewContainer}>
                                            {previewUrls.map((url, index) => (
                                                <div key={index} className={createPostStyles.imagePreview}>
                                                    <img className={createPostStyles.createPostImagePreview} src={url} alt={`Preview ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className={createPostStyles.removeImageButton}
                                                        onClick={() => removeFile(index)}
                                                        disabled={isSubmitting}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className={createPostStyles.formActions}>
                                    <button 
                                        type="button" 
                                        className={createPostStyles.cancelButton}
                                        onClick={() => {
                                            // Clean up preview URLs before closing
                                            previewUrls.forEach(url => URL.revokeObjectURL(url));
                                            setPreviewUrls([]);
                                            setSelectedFiles([]);
                                            setShowPostForm(false);
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={createPostStyles.submitButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FaSpinner className={animationStyles.spin} /> 
                                                Posting...
                                            </>
                                        ) : (
                                            'Post'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
                
                {/* Success Message (outside of form) */}
                {success && (
                    <div className={uiStyles.successBanner}>
                        {success}
                    </div>
                )}
                

                {/* Fans Feed */}
                {loadError && (
                    <div className={uiStyles.error}>
                        {loadError}
                    </div>
                )}
                
                {loading ? (
                    <div className={uiStyles.loadingContainer}>
                        <FaSpinner className={animationStyles.spin} />
                        <p>Loading fans...</p>
                    </div>
                ) : fans.length === 0 ? (
                    <div className={uiStyles.emptyState}>
                        <FaFan size={40} />
                        <h3>No fans found</h3>
                        <p>Be the first to create a fan post!</p>
                    </div>
                ) : (
                    fans.map((fan) => (
                        <div key={fan.id} className={fanPostStyles.fanPost}>
                            {/* User Info */}
                            <div className={fanPostStyles.postHeader}>
                                <Avatar
                                    src={fan.user_profile_image}
                                    alt={`${fan.username}'s avatar`}
                                    username={fan.username}
                                    className={fanPostStyles.avatar}
                                    size={40}
                                    onClick={() => navigate(`/user/${fan.username}`)}
                                />
                                <div>
                                    <h4 
                                        className={fanPostStyles.username}
                                        onClick={() => navigate(`/user/${fan.username}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {fan.username || "Anonymous"}
                                    </h4>
                                    <span className={fanPostStyles.postDate}>
                                        {new Date(fan.created_at).toLocaleDateString()} at {new Date(fan.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                
                                {/* Three dots menu */}
                                <div className={fanPostStyles.optionsMenuContainer}>
                                    <button 
                                        className={fanPostStyles.optionsButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveOptionsMenu(activeOptionsMenu === fan.id ? null : fan.id);
                                        }}
                                    >
                                        <FaEllipsisV />
                                    </button>
                                    
                                    {/* Dropdown menu */}
                                    {activeOptionsMenu === fan.id && (
                                        <div className={fanPostStyles.optionsMenu}>
                                            {/* Show edit options only if current user is the post owner */}
                                            {currentUser && currentUser.id === fan.user_id ? (
                                                <>
                                                    <div 
                                                        className={fanPostStyles.optionsMenuItem}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle edit post action
                                                            console.log('Edit post', fan.id);
                                                            setActiveOptionsMenu(null);
                                                        }}
                                                    >
                                                        <FaEdit /> Edit Post
                                                    </div>
                                                    <div 
                                                        className={fanPostStyles.optionsMenuItem}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle edit images action
                                                            console.log('Edit images', fan.id);
                                                            setActiveOptionsMenu(null);
                                                        }}
                                                    >
                                                        <FaImages /> Edit Images
                                                    </div>
                                                </>
                                            ) : (
                                                // Show Report Fan option for posts not owned by current user
                                                <div 
                                                    className={fanPostStyles.optionsMenuItem}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Handle report fan action
                                                        handleReportFan(fan.id);
                                                        setActiveOptionsMenu(null);
                                                    }}
                                                >
                                                    <FaFlag /> Report Fan
                                                </div>
                                            )}
                                            {/* Add other options here that are available to all users */}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fan Image & Details */}
                            {fan.media_count > 0 ? (
                                <div 
                                    className={fanPostStyles.fanImageContainer}
                                    onClick={() => navigate(`/fandetails/${fan.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* Use the actual uploaded image if available, otherwise fallback to placeholder */}
                                    <img 
                                        src={fanMedia[fan.id] ? getMediaUrl(fanMedia[fan.id].file_path) : require(`../assets/fan${(fan.id % 4) + 1}.png`)} 
                                        alt={fan.title} 
                                        className={fanPostStyles.fanImage} 
                                    />
                                </div>
                            ) : (
                                <div 
                                    className={fanPostStyles.noImagePlaceholder}
                                    onClick={() => navigate(`/fandetails/${fan.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FaFan size={40} />
                                    <p>No image available</p>
                                </div>
                            )}
                            
                            <div 
                                className={fanPostStyles.fanDetails}
                                onClick={() => navigate(`/fandetails/${fan.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <h3>{fan.title}</h3>
                                <p>{fan.description || "No description provided."}</p>
                            </div>

                            {/* Interaction Buttons */}
                            <div className={fanPostStyles.interactionButtons}>
                                <div 
                                    onClick={() => handleLike(fan.id)}
                                    className={likedFans[fan.id] ? fanPostStyles.liked : ''}
                                >
                                    <FaHeart className={fanPostStyles.icon} /> 
                                    {fan.likes_count || 0} {fan.likes_count === 1 ? 'Like' : 'Likes'}
                                </div>
                                <div onClick={() => handleCommentClick(fan.id)}>
                                    <FaComment className={fanPostStyles.icon} /> Comment
                                </div>
                                <div onClick={() => handleShare(fan)}>
                                    <FaShare className={fanPostStyles.icon} /> Share
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {/* Loading more indicator */}
                {loadingMore && (
                    <div className={uiStyles.loadingMoreContainer}>
                        <FaSpinner className={animationStyles.spin} />
                        <p>Loading more fans...</p>
                    </div>
                )}
                
                {/* End of content message */}
                {!hasMore && fans.length > 0 && !loadingMore && (
                    <div className={uiStyles.endOfContentMessage}>
                        <p>You've reached the end of the feed!</p>
                    </div>
                )}
            </main>
            
            {/* Comment Modal */}
            {showCommentModal && (
                <div className={commentStyles.modalOverlay}>
                    <div className={commentStyles.commentModal}>
                        <div className={commentStyles.modalHeader}>
                            <h3>Comments</h3>
                            <button 
                                className={commentStyles.closeButton}
                                onClick={closeCommentModal}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className={commentStyles.commentsContainer}>
                            {loadingComments ? (
                                <div className={commentStyles.loadingComments}>
                                    <FaSpinner className={commentStyles.spinner} />
                                    <p>Loading comments...</p>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className={commentStyles.noComments}>
                                    <p>No comments yet. Be the first to comment!</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className={commentStyles.commentItem}>
                                        <div className={commentStyles.commentHeader}>
                                            <Avatar 
                                                src={comment.user_profile_image} 
                                                alt={`${comment.username}'s avatar`}
                                                username={comment.username}
                                                className={commentStyles.commentAvatar}
                                                size={32}
                                                onClick={() => {
                                                    closeCommentModal();
                                                    navigate(`/user/${comment.username}`);
                                                }}
                                            />
                                            <div>
                                                <h4 
                                                    className={commentStyles.commentUsername}
                                                    onClick={() => {
                                                        closeCommentModal();
                                                        navigate(`/user/${comment.username}`);
                                                    }}
                                                >
                                                    {comment.username || "Anonymous"}
                                                </h4>
                                                <span className={commentStyles.commentDate}>
                                                    {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={commentStyles.commentContent}>{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <form className={commentStyles.commentForm} onSubmit={handleCommentSubmit}>
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className={commentStyles.commentInput}
                            />
                            <button 
                                type="submit" 
                                className={commentStyles.commentSubmitButton}
                                disabled={!commentText.trim()}
                            >
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeScreen;