import React from 'react';
import { FaHeart, FaComment, FaShare } from 'react-icons/fa';
import styles from './HomeScreen.module.css';
import Sidebar from "./Sidebar";

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
    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
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