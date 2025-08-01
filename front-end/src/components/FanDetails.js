import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './FanDetails.css';
import LoginButton from './LoginButton';
import { getFanById } from '../network/fanApi.ts';
import { getMediaUrl } from '../network/mediaApi.ts';
import Sidebar from './Sidebar';
import { FaSpinner, FaFan, FaHeart, FaComment, FaShare, FaUser } from 'react-icons/fa';

const FanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fan, setFan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFanDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const fanData = await getFanById(parseInt(id));
                setFan(fanData);
            } catch (err) {
                console.error('Error fetching fan details:', err);
                setError(err.message || 'Failed to load fan details');
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchFanDetails();
        }
    }, [id]);

    return (
        <div className="container">
            <Sidebar />
            
            <main className="mainContent">
                {loading ? (
                    <div className="loadingContainer">
                        <FaSpinner className="spinner" />
                        <p>Loading fan details...</p>
                    </div>
                ) : error ? (
                    <div className="error">
                        <p>{error}</p>
                        <button onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                ) : fan ? (
                    <div className="fanDetailsContainer">
                        <div className="header">
                            <h1>{fan.title}</h1>
                            <div className="userInfo">
                                <img 
                                    src={fan.user_profile_image || "https://via.placeholder.com/40"} 
                                    alt={`${fan.username}'s avatar`} 
                                    className="avatar"
                                    onClick={() => navigate(`/profile/${fan.user_id}`)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <span 
                                    onClick={() => navigate(`/profile/${fan.user_id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {fan.username || "Anonymous"}
                                </span>
                                <span className="postDate">
                                    {new Date(fan.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="fanContent">
                            {fan.media && fan.media.length > 0 ? (
                                <div className="mediaContainer">
                                    <img 
                                        src={getMediaUrl(fan.media[0].file_path)} 
                                        alt={fan.title} 
                                        className="fanImage" 
                                    />
                                </div>
                            ) : (
                                <div className="noImagePlaceholder">
                                    <FaFan size={60} />
                                    <p>No image available</p>
                                </div>
                            )}
                            
                            <div className="description">
                                <p>{fan.description || "No description provided."}</p>
                            </div>
                            
                            <div className="stats">
                                <div><FaHeart /> {fan.likes_count || 0} Likes</div>
                                <div><FaComment /> {fan.comments?.length || 0} Comments</div>
                            </div>
                        </div>
                        
                        {fan.comments && fan.comments.length > 0 && (
                            <div className="commentsSection">
                                <h3>Comments</h3>
                                {fan.comments.map(comment => (
                                    <div key={comment.id} className="comment">
                                        <img 
                                            src={comment.user_profile_image || "https://via.placeholder.com/30"} 
                                            alt={`${comment.username}'s avatar`} 
                                            className="commentAvatar"
                                        />
                                        <div className="commentContent">
                                            <div className="commentHeader">
                                                <span className="commentUsername">{comment.username}</span>
                                                <span className="commentDate">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p>{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <button 
                            className="backButton"
                            onClick={() => navigate('/')}
                        >
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <div className="notFound">
                        <h2>Fan not found</h2>
                        <button onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FanDetails;
