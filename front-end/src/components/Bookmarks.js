import React from 'react';
import styles from './Bookmarks.module.css';
import Sidebar from "./Sidebar";

const Bookmarks = () => {
    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
                <h1>Bookmarks</h1>
                <p>This is the bookmarks page.</p>
            </main>
        </div>
    );
};

export default Bookmarks;
