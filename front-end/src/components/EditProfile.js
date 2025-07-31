import React from 'react';
import { FaCamera } from 'react-icons/fa';
import styles from './Profile.module.css';
import Sidebar from './Sidebar';

const EditProfile = () => {
    return (
        <div className={styles.container}>
            <Sidebar />

            <main className={styles.mainContent}>
                <h1>Edit Profile</h1>

                {/* Cover Photo */}
                <div className={styles.coverPhoto}>
                    <button className={styles.editCoverPhoto}>
                        <FaCamera />
                    </button>
                </div>

                {/* Profile Details */}
                <div className={styles.profileDetails}>
                    <div className={styles.profileAvatar}>
                        <button className={styles.editAvatar}>
                            <FaCamera />
                        </button>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Display Name</label>
                        <input type="text" placeholder="FanEnthusiast" />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Username</label>
                        <input type="text" value="@FanEnthusiast" readOnly />
                    </div>

                    <div className={styles.profileBio}>
                        <label>Bio</label>
                        <textarea placeholder="Add your bio here...">Your #1 source for the hottest spins and coolest breezes. Daily uploads of ceiling fans, box fans, and more!</textarea>
                    </div>

                    <div className={styles.profileWebsite}>
                        <label>Website URL</label>
                        <input type="text" placeholder="https://example.com" value="https://fansite.com" />
                    </div>

                    <div className={styles.profileWishlist}>
                        <label>Amazon Wishlist</label>
                        <input type="text" placeholder="Add your Amazon Wishlist URL" />
                    </div>

                    <button className={styles.saveProfile}>Save</button>
                </div>
            </main>
        </div>
    );
};

export default EditProfile;