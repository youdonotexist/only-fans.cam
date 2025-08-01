import React, { useState } from 'react';
import styles from './Messages.module.css';
import Sidebar from "./Sidebar";
import { 
    FaEnvelope, FaSearch, FaEllipsisH, FaPhone, 
    FaVideo, FaInfoCircle, FaPaperPlane, FaPlus 
} from 'react-icons/fa';

const Messages = () => {
    // Sample conversations data
    const [conversations, setConversations] = useState([
        {
            id: 1,
            name: 'FanMaster',
            avatar: 'https://via.placeholder.com/48',
            lastMessage: 'Hey, I really liked your Industrial Fan post!',
            time: '2m',
            unread: 2,
            online: true
        },
        {
            id: 2,
            name: 'CeilingFanEnthusiast',
            avatar: 'https://via.placeholder.com/48',
            lastMessage: 'Do you have any vintage ceiling fans?',
            time: '1h',
            unread: 0,
            online: false
        },
        {
            id: 3,
            name: 'TableFanLover',
            avatar: 'https://via.placeholder.com/48',
            lastMessage: 'Thanks for the recommendation!',
            time: '3h',
            unread: 0,
            online: true
        }
    ]);

    // Sample messages data
    const [messages, setMessages] = useState([
        {
            id: 1,
            senderId: 1, // FanMaster
            text: 'Hey, I really liked your Industrial Fan post!',
            time: '10:30 AM',
            date: 'Today'
        },
        {
            id: 2,
            senderId: 'me',
            text: 'Thanks! I appreciate that. It\'s one of my favorite models.',
            time: '10:32 AM',
            date: 'Today'
        },
        {
            id: 3,
            senderId: 1,
            text: 'Do you have any other industrial fans you could showcase?',
            time: '10:33 AM',
            date: 'Today'
        },
        {
            id: 4,
            senderId: 'me',
            text: 'Yes, I have a few more that I\'ll be posting soon. Stay tuned!',
            time: '10:35 AM',
            date: 'Today'
        },
        {
            id: 5,
            senderId: 1,
            text: 'Awesome! Can\'t wait to see them.',
            time: '10:36 AM',
            date: 'Today'
        }
    ]);

    // State for active conversation
    const [activeConversation, setActiveConversation] = useState(1);
    
    // State for new message input
    const [newMessage, setNewMessage] = useState('');

    // Get active conversation details
    const getActiveConversation = () => {
        return conversations.find(conv => conv.id === activeConversation);
    };

    // Handle sending a new message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const newMsg = {
            id: messages.length + 1,
            senderId: 'me',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: 'Today'
        };

        setMessages([...messages, newMsg]);
        setNewMessage('');
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        if (!groups[message.date]) {
            groups[message.date] = [];
        }
        groups[message.date].push(message);
        return groups;
    }, {});

    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.messagesContainer}>
                    {/* Conversations List */}
                    <div className={styles.conversationsList}>
                        <div className={styles.conversationsHeader}>
                            <h1>
                                <FaEnvelope /> Messages
                                <FaPlus style={{ cursor: 'pointer' }} />
                            </h1>
                            <div className={styles.searchBar}>
                                <FaSearch />
                                <input type="text" placeholder="Search messages" />
                            </div>
                        </div>

                        {conversations.map(conversation => (
                            <div 
                                key={conversation.id}
                                className={`${styles.conversationItem} ${conversation.id === activeConversation ? styles.active : ''}`}
                                onClick={() => setActiveConversation(conversation.id)}
                            >
                                <div style={{ position: 'relative' }}>
                                    <img 
                                        src={conversation.avatar} 
                                        alt={conversation.name} 
                                        className={styles.conversationAvatar} 
                                    />
                                    {conversation.online && <div className={styles.onlineIndicator}></div>}
                                </div>
                                <div className={styles.conversationInfo}>
                                    <div className={styles.conversationHeader}>
                                        <span className={styles.conversationName}>{conversation.name}</span>
                                        <span className={styles.conversationTime}>{conversation.time}</span>
                                    </div>
                                    <div className={styles.conversationPreview}>
                                        {conversation.lastMessage}
                                        {conversation.unread > 0 && (
                                            <span className={styles.unreadBadge}>{conversation.unread}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Area */}
                    <div className={styles.chatArea}>
                        {activeConversation ? (
                            <>
                                <div className={styles.chatHeader}>
                                    <div className={styles.chatHeaderInfo}>
                                        <img 
                                            src={getActiveConversation()?.avatar} 
                                            alt={getActiveConversation()?.name} 
                                            className={styles.chatHeaderAvatar} 
                                        />
                                        <div>
                                            <div className={styles.chatHeaderName}>{getActiveConversation()?.name}</div>
                                            <div className={styles.chatHeaderStatus}>
                                                {getActiveConversation()?.online ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.chatHeaderActions}>
                                        <button title="Call"><FaPhone /></button>
                                        <button title="Video call"><FaVideo /></button>
                                        <button title="Info"><FaInfoCircle /></button>
                                        <button title="More"><FaEllipsisH /></button>
                                    </div>
                                </div>

                                <div className={styles.messagesArea}>
                                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                                        <React.Fragment key={date}>
                                            <div className={styles.messageDate}>{date}</div>
                                            {msgs.map(message => (
                                                <div 
                                                    key={message.id}
                                                    className={`${styles.message} ${message.senderId === 'me' ? styles.sent : styles.received}`}
                                                >
                                                    {message.text}
                                                    <div className={styles.messageTime}>{message.time}</div>
                                                </div>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <form className={styles.messageInput} onSubmit={handleSendMessage}>
                                    <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit"><FaPaperPlane /></button>
                                </form>
                            </>
                        ) : (
                            <div className={styles.emptyChat}>
                                <FaEnvelope />
                                <h2>Your Messages</h2>
                                <p>Send private messages to other fan enthusiasts</p>
                                <button>Start a Conversation</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Messages;
