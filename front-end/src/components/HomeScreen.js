import React, { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaShare, FaPlus, FaSpinner, FaTimes, FaFan, FaPaperPlane, FaEllipsisV, FaEdit, FaFlag, FaTrash } from 'react-icons/fa';
import layoutStyles from './Layout.module.css';
import createPostStyles from './CreatePost.module.css';
import fanPostStyles from './FanPost.module.css';
import commentStyles from './Comments.module.css';
import animationStyles from './Animations.module.css';
import uiStyles from './UI.module.css';
import Sidebar from "./Sidebar";
import PostModal from "./PostModal";
import { getAllFans, likeFan, unlikeFan, getFanById, addComment, updateFan, deleteFan } from '../network/fanApi.ts';
import { deleteMedia } from '../network/mediaApi.ts';
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
    
    // State for post form
    const [showPostForm, setShowPostForm] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    
    // State for fan media
    const [fanMedia, setFanMedia] = useState({});
    
    // State for post options menu
    const [activeOptionsMenu, setActiveOptionsMenu] = useState(null);
    
    // State for editing posts
    const [isEditing, setIsEditing] = useState(false);
    const [editingFanId, setEditingFanId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editFanType, setEditFanType] = useState('ceiling');
    
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
    
    // Function to fetch fans (can be called from anywhere in the component)
    const fetchFans = async () => {
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
            
            // Fetch details (media and comments) for each fan
            const detailsPromises = response.fans.map(async (fan) => {
                try {
                    const fanDetails = await getFanById(fan.id);
                    return { 
                        fanId: fan.id, 
                        media: fanDetails.media,
                        commentsCount: fanDetails.comments ? fanDetails.comments.length : 0
                    };
                } catch (err) {
                    console.error(`Error fetching details for fan ${fan.id}:`, err);
                    return { fanId: fan.id, media: [], commentsCount: 0 };
                }
            });
            
            const detailsResults = await Promise.all(detailsPromises);
            
            // Process media results
            const mediaMap = {};
            detailsResults.forEach(result => {
                if (result.media && result.media.length > 0) {
                    mediaMap[result.fanId] = result.media[0]; // Use the first media item
                }
            });
            
            // Add comments count to fans
            const updatedFans = response.fans.map(fan => {
                const details = detailsResults.find(d => d.fanId === fan.id);
                return {
                    ...fan,
                    comments_count: details ? details.commentsCount : 0
                };
            });
            
            setFans(updatedFans);
            setFanMedia(mediaMap);
        } catch (err) {
            console.error('Error fetching fans:', err);
            setLoadError(err.message || 'Failed to load fans');
        } finally {
            setLoading(false);
        }
    };

    // Fetch initial fans from backend
    useEffect( () => {
        fetchFans();
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
            
            // Update comment count in fans list
            setFans(prevFans => 
                prevFans.map(fan => {
                    if (fan.id === currentFanId) {
                        return { 
                            ...fan, 
                            comments_count: (fan.comments_count || 0) + 1 
                        };
                    }
                    return fan;
                })
            );
            
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
                // Will set fans after adding comments_count
                setPage(nextPage);
                
                // Update hasMore flag
                setHasMore(response.pagination.page < response.pagination.totalPages);
                
                // Initialize liked status for new fans
                const newLikedState = { ...likedFans };
                response.fans.forEach(fan => {
                    newLikedState[fan.id] = false;
                });
                setLikedFans(newLikedState);
                
                // Fetch details (media and comments) for each new fan
                const detailsPromises = response.fans.map(async (fan) => {
                    try {
                        const fanDetails = await getFanById(fan.id);
                        return { 
                            fanId: fan.id, 
                            media: fanDetails.media,
                            commentsCount: fanDetails.comments ? fanDetails.comments.length : 0
                        };
                    } catch (err) {
                        console.error(`Error fetching details for fan ${fan.id}:`, err);
                        return { fanId: fan.id, media: [], commentsCount: 0 };
                    }
                });
                
                const detailsResults = await Promise.all(detailsPromises);
                
                // Process media results
                const newMediaMap = { ...fanMedia };
                detailsResults.forEach(result => {
                    if (result.media && result.media.length > 0) {
                        newMediaMap[result.fanId] = result.media[0]; // Use the first media item
                    }
                });
                
                // Add comments count to new fans
                const updatedNewFans = response.fans.map(fan => {
                    const details = detailsResults.find(d => d.fanId === fan.id);
                    return {
                        ...fan,
                        comments_count: details ? details.commentsCount : 0
                    };
                });
                
                // Update fans list with the new fans that have comments_count
                setFans(prevFans => [...prevFans, ...updatedNewFans]);
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
        const handleScroll = async () => {
            // Check if user has scrolled to the bottom of the page
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 300 // Load more when 300px from bottom
            ) {
                await loadMoreFans();
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
                const response = await fetch(`${process.env.REACT_APP_API_URL}/flagged-fans`, {
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
    
    
    return (
        <div className={layoutStyles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={layoutStyles.mainContent}>
                {/* Create Post Section */}
                <div className={createPostStyles.createPostSection}>
                    <button 
                        className={createPostStyles.createPostButton}
                        onClick={() => {
                            if (currentUser) {
                                setShowPostForm(true);
                            } else {
                                openLoginModal('/');
                            }
                        }}
                    >
                        <FaPlus /> Create New Post
                    </button>
                    
                    {/* Post Modal */}
                    <PostModal 
                        isOpen={showPostForm}
                        onClose={() => {
                            setShowPostForm(false);
                            
                            // Reset editing state if we were editing
                            if (isEditing) {
                                setIsEditing(false);
                                setEditingFanId(null);
                            }
                        }}
                        onPostCreated={(updatedFan) => {
                            // Handle the newly created or updated fan
                            if (isEditing) {
                                // Update the fan in the list
                                setFans(prevFans => 
                                    prevFans.map(fan => 
                                        fan.id === updatedFan.id ? updatedFan : fan
                                    )
                                );
                                
                                // Update fan media
                                if (updatedFan.media && updatedFan.media.length > 0) {
                                    setFanMedia(prev => ({
                                        ...prev,
                                        [updatedFan.id]: updatedFan.media
                                    }));
                                }
                            } else {
                                // Add the new fan to the beginning of the list
                                setFans(prevFans => [updatedFan, ...prevFans]);
                                
                                // Add fan media
                                if (updatedFan.media && updatedFan.media.length > 0) {
                                    setFanMedia(prev => ({
                                        ...prev,
                                        [updatedFan.id]: updatedFan.media
                                    }));
                                }
                            }
                            
                            // Reset editing state
                            setIsEditing(false);
                            setEditingFanId(null);
                        }}
                        fanId={editingFanId}
                        isEditing={isEditing}
                        initialValues={{
                            title: isEditing ? editTitle : '',
                            description: isEditing ? editDescription : '',
                            fan_type: isEditing ? editFanType : 'ceiling',
                            media: isEditing && editingFanId && fanMedia[editingFanId] ? fanMedia[editingFanId] : []
                        }}
                    />
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
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            // Handle edit post action
                                                            setEditingFanId(fan.id);
                                                            setEditTitle(fan.title || '');
                                                            setEditDescription(fan.description || '');
                                                            setEditFanType(fan.fan_type || 'ceiling');
                                                            
                                                            // Fetch fan details to get media
                                                            try {
                                                                const fanDetails = await getFanById(fan.id);
                                                                // Store media in fanMedia state first
                                                                setFanMedia(prev => ({
                                                                    ...prev,
                                                                    [fan.id]: fanDetails.media
                                                                }));
                                                                
                                                                // Only after media is stored, set editing state
                                                                setIsEditing(true);
                                                                setShowPostForm(true);
                                                            } catch (err) {
                                                                console.error('Error fetching fan details for editing:', err);
                                                                alert('Error loading post details. Please try again.');
                                                                // Don't show the modal if there's an error
                                                            }
                                                            
                                                            setActiveOptionsMenu(null);
                                                        }}
                                                    >
                                                        <FaEdit /> Edit Post
                                                    </div>
                                                    <div 
                                                        className={fanPostStyles.optionsMenuItem}
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            // Handle delete post action
                                                            if (window.confirm('Are you sure you want to delete this post?')) {
                                                                try {
                                                                    const token = localStorage.getItem('token');
                                                                    if (!token) {
                                                                        openLoginModal(window.location.pathname);
                                                                        return;
                                                                    }
                                                                    
                                                                    // Delete the fan post
                                                                    await deleteFan(fan.id, token);
                                                                    
                                                                    // Remove the deleted fan from the state
                                                                    setFans(prevFans => prevFans.filter(f => f.id !== fan.id));
                                                                    
                                                                    // Show success message
                                                                    setSuccess('Post deleted successfully!');
                                                                    
                                                                    // Clear success message after 3 seconds
                                                                    setTimeout(() => {
                                                                        setSuccess('');
                                                                    }, 3000);
                                                                } catch (err) {
                                                                    console.error('Error deleting post:', err);
                                                                    setError(err.message || 'Failed to delete post');
                                                                    
                                                                    // Clear error message after 3 seconds
                                                                    setTimeout(() => {
                                                                        setError('');
                                                                    }, 3000);
                                                                }
                                                            }
                                                            setActiveOptionsMenu(null);
                                                        }}
                                                    >
                                                        <FaTrash /> Delete Post
                                                    </div>
                                                </>
                                            ) : (
                                                // Show Report Fan option for posts not owned by current user
                                                <div 
                                                    className={fanPostStyles.optionsMenuItem}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        // Handle report fan action
                                                        await handleReportFan(fan.id);
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
                                        src={getMediaUrl(fanMedia[fan.id].file_path)}
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
                                    <FaComment className={fanPostStyles.icon} /> Comment {fan.comments_count ? `(${fan.comments_count})` : ''}
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