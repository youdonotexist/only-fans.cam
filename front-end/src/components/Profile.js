import React, { useState, useEffect } from 'react';
import {
    FaEnvelope,
    FaBookmark,
    FaCamera,
    FaEdit,
    FaFan,
    FaSpinner,
    FaSignOutAlt,
    FaKey,
    FaLock,
    FaBell
} from 'react-icons/fa';
import styles from './Profile.module.css';
import Sidebar from "./Sidebar";
import { useParams, useNavigate } from 'react-router-dom';
import { getFansByUser, getFanById } from '../network/fanApi';
import { uploadProfileImage, uploadCoverImage, getUserByUsername, changePassword } from '../network/userApi.ts';
import Avatar from './Avatar';
import { useAuth } from '../contexts/AuthContext';

// Import user API functions directly from the file
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Get current user's profile
const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user data');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Get user error: ${error.message}`);
  }
};

// Get user by ID
const getUserById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user data');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Get user error: ${error.message}`);
  }
};

// Update current user's profile
const updateUser = async (userData, token) => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Update user error: ${error.message}`);
  }
};

const Profile = () => {

    const params = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [fanPosts, setFanPosts] = useState([]);
    const [fanDetails, setFanDetails] = useState({});
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    
    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setSuccessMessage('Logged out successfully!');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            navigate('/');
            window.location.reload(); // Reload to update UI
        }, 1500);
    };
    
    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }
        
        try {
            setChangingPassword(true);
            setError(null);
            setSuccessMessage('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to change your password');
                setChangingPassword(false);
                return;
            }
            
            // Call API to change password
            const result = await changePassword(
                passwordData.currentPassword,
                passwordData.newPassword,
                token
            );
            
            // Reset form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            // Hide form
            setShowPasswordForm(false);
            
            // Show success message
            setSuccessMessage(result.message || 'Password changed successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.message || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    // State for editing modes
    const [isEditingCover, setIsEditingCover] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState({
        username: false,
        bio: false
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    
    // State for password change
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);
    
    // State for tracking changes during editing
    const [editedUser, setEditedUser] = useState(null);
    
    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                // If viewing own profile or no specific ID
                if (params.id === 'me' || (!params.id && !params.username)) {
                    if (!token) {
                        setError('You must be logged in to view your profile');
                        setLoading(false);
                        return;
                    }
                    const userData = await getCurrentUser(token);
                    setUser(userData);
                    setIsOwnProfile(true);
                } else if (params.username) {
                    // Viewing a profile by username
                    const userData = await getUserByUsername(params.username);
                    setUser(userData);
                    // Check if this is the current user's profile
                    setIsOwnProfile(currentUser && currentUser.username === userData.username);
                } else {
                    // Viewing another user's profile by ID
                    const userData = await getUserById(parseInt(params.id));
                    setUser(userData);
                    // Check if this is the current user's profile
                    setIsOwnProfile(currentUser && currentUser.id === userData.id);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err.message || 'Failed to load user profile');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [params.id, params.username, currentUser]);
    
    // Fetch user's fan posts
    const fetchUserFanPosts = async (userId) => {
        try {
            setLoadingPosts(true);
            const response = await getFansByUser(userId);
            setFanPosts(response.fans || []);
            
            // Fetch detailed information for each fan post
            const detailsObj = {};
            for (const post of response.fans || []) {
                try {
                    const details = await getFanById(post.id);
                    detailsObj[post.id] = details;
                } catch (detailErr) {
                    console.error(`Error fetching details for fan post ${post.id}:`, detailErr);
                }
            }
            setFanDetails(detailsObj);
            
            setLoadingPosts(false);
        } catch (err) {
            console.error('Error fetching user fan posts:', err);
            setLoadingPosts(false);
        }
    };
    
    // Fetch fan posts when user data is loaded
    useEffect(() => {
        if (user && user.id) {
            fetchUserFanPosts(user.id);
        }
    }, [user]);



    // Handle Cover Photo Edit
    const handleEditCoverPress = () => {
        if (uploadingCover) return; // Prevent multiple uploads
        
        const input = document.getElementById('coverImagePicker');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Show preview immediately
                const reader = new FileReader();
                reader.onload = () => {
                    const imgElement = document.getElementById('coverImage');
                    imgElement.src = reader.result;
                };
                reader.readAsDataURL(file);
                
                // Upload to server
                try {
                    setUploadingCover(true);
                    setError(null);
                    
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setError('You must be logged in to upload an image');
                        setUploadingCover(false);
                        return;
                    }
                    
                    // Use the dedicated uploadCoverImage function
                    const updatedUser = await uploadCoverImage(file, token);
                    setUser(updatedUser);
                    setSuccessMessage('Cover photo updated successfully!');
                    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        setSuccessMessage('');
                    }, 3000);
                } catch (err) {
                    console.error('Error uploading cover photo:', err);
                    setError(err.message || 'Failed to upload cover photo');
                } finally {
                    setUploadingCover(false);
                    setIsEditingCover(false);
                }
            }
        };
        input.click();
    };

    // Handle Avatar Photo Edit
    const handleEditAvatarPress = () => {
        const input = document.getElementById("avatarPicker");

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Show preview immediately
                const reader = new FileReader();
                reader.onload = () => {
                    const imgElement = document.getElementById('avatarImage');
                    imgElement.src = reader.result;
                };
                reader.readAsDataURL(file);
                
                // Upload to server
                try {
                    setUploadingImage(true);
                    setError(null);
                    
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setError('You must be logged in to upload an image');
                        setUploadingImage(false);
                        return;
                    }
                    
                    const updatedUser = await uploadProfileImage(file, token);
                    setUser(updatedUser);
                    setSuccessMessage('Profile image updated successfully!');
                    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        setSuccessMessage('');
                    }, 3000);
                } catch (err) {
                    console.error('Error uploading profile image:', err);
                    setError(err.message || 'Failed to upload profile image');
                } finally {
                    setUploadingImage(false);
                    setIsEditingAvatar(false);
                }
            }
        };

        input.click();
        setIsEditingAvatar(prev => !prev);
    };

    // Handle Profile Bio Edit
    const handleEditProfilePress = () => {
        console.log("Entering profile edit mode");
        // Initialize editedUser with current user data
        setEditedUser({...user});
        setIsEditingBio({
            username: true,
            bio: true
        });
    };
    
    // Handle profile update
    const handleProfileUpdate = async (updatedData) => {
        try {
            // Clear any previous messages
            setError(null);
            setSuccessMessage('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to update your profile');
                return;
            }
            
            // Show loading state or disable button here if needed
            
            const updatedUser = await updateUser(updatedData, token);
            setUser(updatedUser);
            
            // Exit editing mode
            setIsEditingBio({
                username: false,
                bio: false
            });
            
            // Reset edited user
            setEditedUser(null);
            
            // Set success message
            setSuccessMessage('Profile updated successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile');
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <p>Loading profile...</p>
                </main>
            </div>
        );
    }
    
    // Show error state
    if (error) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <p className={styles.error}>{error}</p>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar/>

            {/* Main Profile Content */}
            <main className={styles.mainContent}>
                <div className={styles.profileHeader}>
                    <div className={styles.coverPhoto} onClick={isOwnProfile && !uploadingCover ? handleEditCoverPress : undefined}>
                        {/* Cover Photo Button */}
                        <img 
                            id={"coverImage"} 
                            className={styles.coverImg}
                            src={user?.cover_image || ""}
                        />
                        <input id="coverImagePicker" type="file" accept="image/*" style={{display: "none"}} />
                        
                        {isOwnProfile && (
                            uploadingCover ? (
                                <div className={styles.uploadingCoverOverlay}>
                                    <FaSpinner className={styles.spinner} /> Uploading...
                                </div>
                            ) : (
                                <div className={styles.editCoverButton}>
                                    <FaCamera/> Edit Cover
                                </div>
                            )
                        )}
                    </div>

                    {/* Avatar Section */}
                    <div className={styles.profileInfo}>
                        <div>
                            <Avatar
                                src={user.profile_image}
                                alt={`${user?.username}'s avatar`}
                                className={styles.avatar}
                                onClick={isOwnProfile && !uploadingImage ? handleEditAvatarPress : undefined}
                            />

                            {/* Avatar Edit Button */}
                            <input id="avatarPicker" type="file" accept="image/*" style={{display: "none"}} />
                            
                            {isOwnProfile && (
                                uploadingImage ? (
                                    <div className={styles.uploadingOverlay}>
                                        <FaSpinner className={styles.spinner} />
                                    </div>
                                ) : (
                                    <FaCamera/>
                                )
                            )}
                        </div>

                        {/* Username and Bio Editing */}
                        <h2 className={styles.username}>
                            {isEditingBio.username ?
                                <>
                                    <input
                                        type="text"
                                        value={editedUser?.username || ""}
                                        onChange={(e) => {
                                            // Limit username to 30 characters
                                            if (e.target.value.length <= 30) {
                                                setEditedUser({...editedUser, username: e.target.value});
                                            }
                                        }}
                                        maxLength={30}
                                    />
                                    <div className={styles.charCount}>
                                        {(editedUser?.username || "").length}/30
                                    </div>
                                </>
                             :
                                `@${user?.username || "User"}`}
                        </h2>

                        <p className={styles.bio}>
                            {isEditingBio.bio ? (
                                <>
                                    <textarea
                                        rows={3}
                                        value={editedUser?.bio || ""}
                                        onChange={(e) => {
                                            // Limit bio to 250 characters
                                            if (e.target.value.length <= 250) {
                                                setEditedUser({...editedUser, bio: e.target.value});
                                            }
                                        }}
                                        maxLength={250}
                                    />
                                    <div className={styles.charCount}>
                                        {(editedUser?.bio || "").length}/250
                                    </div>
                                </>
                            ) : (
                                user?.bio || "No bio available"
                            )}
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className={styles.successMessage}>
                            {successMessage}
                        </div>
                    )}
                    
                    {/* Error Message */}
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                    
                    {/* Profile Action Buttons */}
                    {isOwnProfile ? (
                        isEditingBio.username || isEditingBio.bio ? (
                            <div className={styles.editButtons}>
                                <button
                                    className={styles.saveProfileBtn}
                                    onClick={() => handleProfileUpdate({
                                        username: editedUser.username,
                                        bio: editedUser.bio
                                    })}
                                >
                                    Save Changes
                                </button>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => {
                                        setIsEditingBio({
                                            username: false,
                                            bio: false
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className={styles.profileActions}>
                                <button
                                    className={styles.editProfileBtn}
                                    onClick={handleEditProfilePress}
                                >
                                    <FaEdit/> Edit Profile
                                </button>
                                <button
                                    className={styles.changePasswordBtn}
                                    onClick={() => setShowPasswordForm(true)}
                                >
                                    <FaKey/> Change Password
                                </button>
                                <button
                                    className={styles.logoutBtn}
                                    onClick={handleLogout}
                                >
                                    <FaSignOutAlt/> Logout
                                </button>
                            </div>
                        )
                    ) : (
                        <div className={styles.profileActions}>
                            <button className={styles.subscribeBtn}>
                                <FaBell/> Subscribe
                            </button>
                            <button className={styles.messageBtn}>
                                <FaEnvelope/> Message
                            </button>
                            <button className={styles.bookmarkBtn}>
                                <FaBookmark/> Bookmark
                            </button>
                        </div>
                    )}
                </div>

                {/* Password Change Form */}
                {showPasswordForm && (
                    <div className={styles.passwordFormContainer}>
                        <div className={styles.passwordForm}>
                            <h3><FaLock /> Change Password</h3>
                            <form onSubmit={handlePasswordChange}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="currentPassword">Current Password</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className={styles.passwordFormButtons}>
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                            setError(null);
                                        }}
                                        disabled={changingPassword}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.saveProfileBtn}
                                        disabled={changingPassword}
                                    >
                                        {changingPassword ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Stats Section */}
                <div className={styles.stats}>
                    <div><strong>Fans</strong> {user?.fans_count || 0}</div>
                    <div><strong>Following</strong> {user?.following_count || 0}</div>
                    <div><strong>Posts</strong> {fanPosts.length}</div>
                </div>

                {/* Feed Section */}
                <section className={styles.feed}>
                    <div className={styles.feedHeader}>
                        <h3>Posts</h3>
                    </div>
                    
                    {/* Loading state for posts */}
                    {loadingPosts && (
                        <p>Loading posts...</p>
                    )}
                    
                    {/* No posts message */}
                    {!loadingPosts && fanPosts.length === 0 && (
                        <p>No fan posts yet. Create your first post!</p>
                    )}
                    
                    {/* Display user's fan posts */}
                    <div className={styles.feedContent}>
                        {fanPosts.map(post => (
                            <div key={post.id} className={styles.post}>
                                <h4 
                                    onClick={() => navigate(`/fandetails/${post.id}`)}
                                    style={{ cursor: 'pointer' }}
                                    className={styles.clickableTitle}
                                >{post.title}</h4>
                                {(() => {
                                    // Check if we have detailed information with media
                                    const details = fanDetails[post.id];
                                    if (details && details.media && details.media.length > 0) {
                                        // Use the first media item from AWS
                                        const mediaItem = details.media[0];
                                        return (
                                            <div 
                                                onClick={() => navigate(`/fandetails/${post.id}`)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img 
                                                    src={mediaItem.file_path} 
                                                    alt={post.title}
                                                    className={styles.postImage}
                                                />
                                            </div>
                                        );
                                    } else if (post.media_count > 0) {
                                        // If we know there's media but don't have details yet, use a fallback
                                        try {
                                            // Try to load a dynamic image based on post ID
                                            const imgSrc = require(`../assets/fan${(post.id % 4) + 1}.png`);
                                            return (
                                                <div 
                                                    onClick={() => navigate(`/fandetails/${post.id}`)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <img 
                                                        src={imgSrc} 
                                                        alt={post.title}
                                                        className={styles.postImage}
                                                    />
                                                </div>
                                            );
                                        } catch (error) {
                                            // Fallback to placeholder if image can't be loaded
                                            console.error('Error loading image:', error);
                                            return (
                                                <div 
                                                    className={styles.noImagePlaceholder}
                                                    onClick={() => navigate(`/fandetails/${post.id}`)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <FaFan size={40} />
                                                </div>
                                            );
                                        }
                                    } else {
                                        // Show placeholder if no media
                                        return (
                                            <div 
                                                className={styles.noImagePlaceholder}
                                                onClick={() => navigate(`/fandetails/${post.id}`)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <FaFan size={40} />
                                            </div>
                                        );
                                    }
                                })()}
                                <p className={styles.postDescription}>
                                    {post.description || 'No description provided.'}
                                </p>
                                <div className={styles.postMeta}>
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    <span>{post.likes_count || 0} likes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Profile;