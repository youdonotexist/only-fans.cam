import React, { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaShare, FaPlus, FaImage, FaSpinner } from 'react-icons/fa';
import styles from './HomeScreen.module.css';
import Sidebar from "./Sidebar";
import { createFan } from '../network/fanApi.ts';

const fansData = [
    {
        category: "Industrial Fans",
        items: [
            {
                name: "Big Bertha",
                image: require('../assets/fan1.png'),
                specs: {
                    RPMs: 2000,
                    airflow: "50 CFM",
                    energyUsage: "3W"
                }
            }
        ]
    },
    {
        category: "Ceiling Fans",
        items: [ {
            name: "Nano Fan",
            image: require('../assets/fan2.png'),
            specs: {
                RPMs: 1500,
                airflow: "100 CFM",
                energyUsage: "8W"
            }
        }]
    },
    {
        category: "Table Fans",
        items: [
            {
                name: "Standard Table Fan",
                image: require('../assets/fan3.png'),
                specs: {
                    RPMs: 2500,
                    airflow: "200 CFM",
                    energyUsage: "12W"
                }
            }
        ]
    },
    {
        category: "Floor Fans",
        items: [
            {
                name: "Luxury Floor Fan",
                image: require('../assets/fan4.png'),
                specs: {
                    RPMs: 3000,
                    airflow: "300 CFM",
                    energyUsage: "15W"
                }
            }
        ]
    }
];

const HomeScreen = () => {
    // State for new post form
    const [showPostForm, setShowPostForm] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPost(prev => ({
            ...prev,
            [name]: value
        }));
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
            await createFan(newPost, token);
            
            // Reset form
            setNewPost({
                title: '',
                description: ''
            });
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
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Create Post Section */}
                <div className={styles.createPostSection}>
                    {!showPostForm ? (
                        <button 
                            className={styles.createPostButton}
                            onClick={() => setShowPostForm(true)}
                        >
                            <FaPlus /> Create New Post
                        </button>
                    ) : (
                        <div className={styles.createPostForm}>
                            <h3>Create New Fan Post</h3>
                            {error && <div className={styles.error}>{error}</div>}
                            {success && <div className={styles.success}>{success}</div>}
                            
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="title">Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={newPost.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter fan title"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={newPost.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe your fan"
                                        rows={3}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                
                                <div className={styles.formActions}>
                                    <button 
                                        type="button" 
                                        className={styles.cancelButton}
                                        onClick={() => setShowPostForm(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={styles.submitButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FaSpinner className={styles.spinner} /> 
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
                    <div className={styles.successBanner}>
                        {success}
                    </div>
                )}
                
                {/* Stories Section */}
                <div className={styles.stories}>
                    <div className={styles.storyItem}>+ Add to Story</div>
                    <div className={styles.storyItem}>🌟 Micro Fan</div>
                    <div className={styles.storyItem}>🔥 Nano Fan</div>
                </div>

                {/* Fans Feed */}
                {fansData.map((category, index) => (
                    category.items.map((fan, fanIndex) => (
                        <div key={fanIndex} className={styles.fanPost}>
                            {/* Fake User Info */}
                            <div className={styles.postHeader}>
                                <img src="https://via.placeholder.com/40" alt="User Avatar" className={styles.avatar} />
                                <div>
                                    <h4 className={styles.username}>Fan Enthusiast</h4>
                                    <span className={styles.postDate}>2 hours ago</span>
                                </div>
                            </div>

                            {/* Fan Image & Details */}
                            <img src={fan.image} alt={fan.name} className={styles.fanImage} />
                            <div className={styles.fanDetails}>
                                <h3>{fan.name}</h3>
                                <p>💨 {fan.specs.airflow} | ⚡ {fan.specs.energyUsage} | 🔄 {fan.specs.RPMs} RPM</p>
                            </div>

                            {/* Interaction Buttons */}
                            <div className={styles.interactionButtons}>
                                <FaHeart className={styles.icon} /> Like
                                <FaComment className={styles.icon} /> Comment
                                <FaShare className={styles.icon} /> Share
                            </div>
                        </div>
                    ))
                ))}
            </main>
        </div>
    );
};

export default HomeScreen;