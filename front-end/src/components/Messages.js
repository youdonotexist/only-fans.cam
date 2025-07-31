import React from 'react';
import styles from './Messages.module.css';
import Sidebar from "./Sidebar";

const Messages = () => {
    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
                <h1>Messages</h1>
                <p>This is the messages page.</p>
            </main>
        </div>
    );
};

export default Messages;
