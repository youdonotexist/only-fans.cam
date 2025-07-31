import React, {useState} from 'react';
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

const Profile = () => {

    const params= useParams()

    // State for editing modes
    const [isEditingCover, setIsEditingCover] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState({
        username: false,
        bio: false
    });



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
                            <img id={"avatarImage"} className={styles.avatarImg}/>

                            {/* Avatar Edit Button */}
                            <input id="avatarPicker" type="file" accept="image/*" style={{display: "none"}} />
                            <FaCamera/>
                        </div>

                        {/* Username and Bio Editing */}
                        <h2 className={styles.username}>
                            {isEditingBio.username ?
                                <input
                                    type="text"
                                    value="@FanEnthusiast"
                                    onChange={(e) => console.log("Updating username:", e.target.value)}
                                /> :
                                "@" + params.id}
                        </h2>

                        <p className={styles.bio}>
                            {isEditingBio.bio ? (
                                <textarea
                                    rows={3}
                                    value="Your #1 source..."
                                    onChange={(e) => console.log("Updating bio:", e.target.value)}
                                />
                            ) : (
                                "Your #1 source for the hottest spins and coolest breezes. Daily uploads of ceiling fans, box fans, and more!"
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