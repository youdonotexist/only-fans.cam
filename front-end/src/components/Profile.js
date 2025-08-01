import React, { useState, useEffect } from 'react';
import {
    FaEnvelope,
    FaBookmark,
    FaCamera,
    FaEdit,
    FaFan,
} from 'react-icons/fa';
import styles from './Profile.module.css';
import Sidebar from "./Sidebar";
import { useParams } from 'react-router';

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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for editing modes
    const [isEditingCover, setIsEditingCover] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState({
        username: false,
        bio: false
    });
    
    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                // If viewing own profile or no specific ID
                if (params.id === 'me' || !params.id) {
                    if (!token) {
                        setError('You must be logged in to view your profile');
                        setLoading(false);
                        return;
                    }
                    const userData = await getCurrentUser(token);
                    setUser(userData);
                } else {
                    // Viewing another user's profile
                    const userData = await getUserById(parseInt(params.id));
                    setUser(userData);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err.message || 'Failed to load user profile');
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, [params.id]);



    // Handle Cover Photo Edit
    const handleEditCoverPress = () => {
        const input = document.getElementById('coverImagePicker');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const imgElement = document.getElementById('coverImage');
                    imgElement.src = reader.result;
                    setIsEditingCover(false); // Exit editing mode
                    // Stub for server upload:
                    // uploadImageToServer(file);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    // Handle Avatar Photo Edit
    const handleEditAvatarPress = () => {
        const input = document.getElementById("avatarPicker");

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const imgElement = document.getElementById('avatarImage');
                    imgElement.src = reader.result;
                    setIsEditingCover(false); // Exit editing mode
                    // Stub for server upload:
                    // uploadImageToServer(file);
                };
                reader.readAsDataURL(file);
            }
        };

        input.click();



        setIsEditingAvatar(prev => !prev);
    };

    // Handle Profile Bio Edit
    const handleEditProfilePress = () => {
        console.log("Entering profile edit mode");
        setIsEditingBio({
            username: true,
            bio: true
        });
    };
    
    // Handle profile update
    const handleProfileUpdate = async (updatedData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to update your profile');
                return;
            }
            
            const updatedUser = await updateUser(updatedData, token);
            setUser(updatedUser);
            setIsEditingBio({
                username: false,
                bio: false
            });
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
                    <div className={styles.coverPhoto} onClick={handleEditCoverPress}>
                        {/* Cover Photo Button */}
                        <img id={"coverImage"} className={styles.coverImg}/>
                        <input id="coverImagePicker" type="file" accept="image/*" style={{display: "none"}} />
                        <FaCamera/> Edit Cover
                    </div>

                    {/* Avatar Section */}
                    <div className={styles.profileInfo}>
                        <div className={styles.avatar} onClick={handleEditAvatarPress}>
                            <img 
                                id={"avatarImage"} 
                                className={styles.avatarImg}
                                src={user?.profile_image || "https://via.placeholder.com/150"}
                                alt={`${user?.username}'s profile`}
                            />

                            {/* Avatar Edit Button */}
                            <input id="avatarPicker" type="file" accept="image/*" style={{display: "none"}} />
                            <FaCamera/>
                        </div>

                        {/* Username and Bio Editing */}
                        <h2 className={styles.username}>
                            {isEditingBio.username ?
                                <input
                                    type="text"
                                    value={user?.username || ""}
                                    onChange={(e) => {
                                        setUser({...user, username: e.target.value});
                                    }}
                                    onBlur={() => handleProfileUpdate({username: user.username})}
                                /> :
                                `@${user?.username || "User"}`}
                        </h2>

                        <p className={styles.bio}>
                            {isEditingBio.bio ? (
                                <textarea
                                    rows={3}
                                    value={user?.bio || ""}
                                    onChange={(e) => {
                                        setUser({...user, bio: e.target.value});
                                    }}
                                    onBlur={() => handleProfileUpdate({bio: user.bio})}
                                />
                            ) : (
                                user?.bio || "No bio available"
                            )}
                        </p>
                    </div>

                    {/* Edit Profile Button */}
                    <button
                        className={styles.editProfileBtn}
                        onClick={handleEditProfilePress}
                    >
                        <FaEdit/> Edit Profile
                    </button>
                </div>

                {/* Stats Section */}
                <div className={styles.stats}>
                    <div><strong>Fans</strong> 1,250</div>
                    <div><strong>Following</strong> 320</div>
                    <div><strong>Posts</strong> 42</div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                    <button className={styles.subscribeBtn}>Subscribe</button>
                    <button className={styles.messageBtn}><FaEnvelope/> Message</button>
                    <button className={styles.bookmarkBtn}><FaBookmark/> Bookmark</button>
                </div>

                {/* Feed Section */}
                <section className={styles.feed}>
                    <div className={styles.feedHeader}>
                        <h3>Posts</h3>
                    </div>
                    <div className={styles.feedContent}>
                        {/* Example Post */}
                        <div className={styles.post}>
                            <h4>Vintage Ceiling Fan - 1970s Classic</h4>
                            <img src="/images/vintage_ceiling_fan.jpg" alt="Vintage Ceiling Fan"
                                 className={styles.postImage}/>
                            <p className={styles.postDescription}>
                                Check out this amazing 70s-era ceiling fan with authentic wooden blades!
                            </p>
                        </div>
                        {/* Another Example Post */}
                        <div className={styles.post}>
                            <h4>Industrial Strength Box Fan</h4>
                            <img src="/images/industrial_box_fan.jpg" alt="Industrial Box Fan"
                                 className={styles.postImage}/>
                            <p className={styles.postDescription}>
                                Nothing beats this industrial-strength box fan for a powerful breeze.
                            </p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Profile;