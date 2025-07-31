import React from 'react';
import { FaLock, FaHeart, FaComment, FaShare } from 'react-icons/fa';
import styles from './UserProfile.module.css';
import {useParams} from "react-router-dom";

const userData = {
    username: "FanMaster",
    handle: "@fanmaster",
    bio: "All about fans – industrial, ceiling, personal, and more!",
    avatar: "https://via.placeholder.com/80",
    posts: [
        {
            id: 1,
            name: "Turbo Air Circulator",
            image: require('../assets/fan1.png'),
            locked: false,
            likes: 37,
            comments: 56,
            shares: 4
        },
        {
            id: 2,
            name: "Modern Ceiling Breeze",
            image: require('../assets/fan2.png'),
            locked: true,
            likes: 45,
            comments: 12,
            shares: 6
        },
        {
            id: 3,
            name: "Desk Mini Cooler",
            image: require('../assets/fan3.png'),
            locked: true,
            likes: 60,
            comments: 18,
            shares: 9
        }
    ]
};

export default function UserProfile() {
    const {name}= useParams()

    return (
        <div className={styles.container}>
            {/* User Profile Header */}
            <div className={styles.profileHeader}>
                <img src={userData.avatar} alt="User Avatar" className={styles.avatar} />
                <div className={styles.userInfo}>
                    <h2> {name} 🔥</h2>
                    <p>{name} · Seen Yesterday</p>
                    <p className={styles.bio}>{userData.bio}</p>
                </div>
            </div>

            {/* Subscription Section */}
            <div className={styles.subscriptionSection}>
                <button className={styles.subscribeButton}>SUBSCRIBE</button>
                <button className={styles.freeButton}>FOR FREE</button>
            </div>

            {/* Posts Section */}
            <div className={styles.postsSection}>
                <h3>Posts</h3>
                {userData.posts.map((post) => (
                    <div key={post.id} className={styles.post}>
                        <h4>{post.name}</h4>
                        <div className={styles.postContent}>
                            <img src={post.image} alt={post.name} className={styles.postImage} />
                            {post.locked && (
                                <div className={styles.lockedOverlay}>
                                    <FaLock className={styles.lockIcon} />
                                    <p>Subscribe to see this post</p>
                                </div>
                            )}
                        </div>
                        <div className={styles.interactionButtons}>
                            <FaHeart className={styles.icon} /> {post.likes}
                            <FaComment className={styles.icon} /> {post.comments}
                            <FaShare className={styles.icon} /> {post.shares}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};