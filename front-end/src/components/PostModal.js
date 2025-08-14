import React, { useState, useRef, useEffect } from 'react';
import { FaSpinner, FaImage, FaTimes } from 'react-icons/fa';
import styles from './PostModal.module.css';
import uiStyles from './UI.module.css';
import animationStyles from './Animations.module.css';
import { createFan, updateFan, getFanById } from '../network/fanApi.ts';
import { uploadMedia, deleteMedia } from '../network/mediaApi.ts';

// Detect Android device
const isAndroid = /Android/i.test(navigator.userAgent);

/**
 * A reusable modal component for creating and editing posts
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Function} props.onSubmit - Function to call when the form is submitted
 * @param {boolean} props.isEditing - Whether we're editing an existing post
 * @param {Object} props.initialValues - Initial values for the form
 * @param {string} props.initialValues.title - Initial title
 * @param {string} props.initialValues.description - Initial description
 * @param {string} props.initialValues.fan_type - Initial fan type
 * @param {Array} props.initialValues.media - Initial media items
 * @param {boolean} props.isSubmitting - Whether the form is currently being submitted
 * @param {string} props.error - Error message to display
 * @param {string} props.success - Success message to display
 * @param {boolean} props.showFanType - Whether to show the fan type selector
 */
const PostModal = ({
    isOpen,
    onClose,
    onPostCreated, // New callback for when a post is created/updated
    fanId = null,  // Pass fanId when editing
    isEditing = false,
    initialValues = {
        title: '',
        description: '',
        fan_type: 'ceiling',
        media: []
    },
    showFanType = true
}) => {
    // Form state
    const [title, setTitle] = useState(initialValues.title || '');
    const [description, setDescription] = useState(initialValues.description || '');
    const [fanType, setFanType] = useState(initialValues.fan_type || 'ceiling');
    
    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Image upload state
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingMedia, setExistingMedia] = useState([]);
    const [deletedMediaIds, setDeletedMediaIds] = useState([]);
    const fileInputRef = useRef(null);

    // Update form values when initialValues change
    useEffect(() => {
        setTitle(initialValues.title || '');
        setDescription(initialValues.description || '');
        setFanType(initialValues.fan_type || 'ceiling');
        
        // Load existing media if available
        if (isEditing && initialValues.media && initialValues.media.length > 0) {
            setExistingMedia(initialValues.media);
        } else {
            setExistingMedia([]);
        }
        
        // Reset deleted media IDs when modal opens
        setDeletedMediaIds([]);
    }, [initialValues, isEditing]);

    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [previewUrls]);

    // Reset form when modal is closed
    const handleClose = () => {
        // Clean up preview URLs
        previewUrls.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        
        // Reset state
        setSelectedFiles([]);
        setPreviewUrls([]);
        
        // Call onClose callback
        onClose();
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        
        try {
            setIsSubmitting(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to create or edit a post');
                return;
            }
            
            let createdOrUpdatedFan;
            
            if (isEditing && fanId) {
                // Handle deleted media
                if (deletedMediaIds.length > 0) {
                    try {
                        const deletePromises = deletedMediaIds.map(mediaId => 
                            deleteMedia(mediaId, token)
                        );
                        await Promise.all(deletePromises);
                    } catch (err) {
                        console.error('Error deleting media:', err);
                        setError(`Failed to delete media: ${err.message}`);
                        return;
                    }
                }
                
                // Update existing fan post
                const updateData = {
                    title,
                    description,
                    fan_type: fanType
                };
                
                createdOrUpdatedFan = await updateFan(fanId, updateData, token);
                
                // Upload new files if any
                if (selectedFiles.length > 0) {
                    try {
                        await uploadMedia(fanId, selectedFiles, token);
                    } catch (err) {
                        console.error('Error uploading images:', err);
                        setError(`Failed to upload images: ${err.message}`);
                        return;
                    }
                }
                
                setSuccess('Post updated successfully!');
            } else {
                // Create new fan post
                const newPost = {
                    title,
                    description,
                    fan_type: fanType
                };
                
                createdOrUpdatedFan = await createFan(newPost, token);
                
                // Upload images if any
                if (selectedFiles.length > 0) {
                    try {
                        await uploadMedia(createdOrUpdatedFan.id, selectedFiles, token);
                    } catch (err) {
                        console.error('Error uploading images:', err);
                        setError(`Post created but failed to upload images: ${err.message}`);
                        return;
                    }
                }
                
                setSuccess('Post created successfully!');
            }
            
            // Get the updated fan with media
            const updatedFan = await getFanById(createdOrUpdatedFan.id);
            
            // Notify parent component
            if (onPostCreated) {
                onPostCreated(updatedFan);
            }
            
            // Close modal after a short delay to show success message
            setTimeout(() => {
                handleClose();
            }, 1500);
            
        } catch (err) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} post:`, err);
            setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} post`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Resize image and create preview
    const resizeAndCreatePreview = (file) => {
        return new Promise((resolve) => {
            // Preserve animation for GIFs by using an object URL and skipping canvas resizing
            if (file.type === 'image/gif') {
                const url = URL.createObjectURL(file);
                resolve(url);
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                if (!event.target || !event.target.result) {
                    resolve(null);
                    return;
                }
                
                // For small files, just use the data URL directly
                if (file.size < 300000) { // Less than 300KB
                    resolve(event.target.result.toString());
                    return;
                }
                
                // For larger files, resize the image
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Get the data URL from the canvas with reduced quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                
                img.src = event.target.result.toString();
            };
            reader.readAsDataURL(file);
        });
    };

    // Handle file selection
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Validate files (only images)
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
            console.error('Only image files are allowed');
            return;
        }

        // Add files to selectedFiles state
        setSelectedFiles(prev => [...prev, ...validFiles]);
        
        // Create preview URLs with resizing
        for (const file of validFiles) {
            const previewUrl = await resizeAndCreatePreview(file);
            if (previewUrl) {
                setPreviewUrls(prev => [...prev, previewUrl]);
            }
        }
    };

    // Remove a selected file
    const removeFile = (index) => {
        // Simply remove the file and preview URL from state
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };
    
    // Remove an existing media item
    const removeExistingMedia = (mediaId) => {
        // Add the media ID to the list of deleted media IDs
        setDeletedMediaIds(prev => [...prev, mediaId]);
        
        // Remove the media item from the existing media state
        setExistingMedia(prev => prev.filter(media => media.id !== mediaId));
    };

    // If the modal is not open, don't render anything
    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>{isEditing ? 'Edit Fan Post' : 'Create New Fan Post'}</h3>
                    <button 
                        className={styles.closeButton}
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <FaTimes />
                    </button>
                </div>

                {error && <div className={uiStyles.error}>{error}</div>}
                {success && <div className={uiStyles.success}>{success}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className={uiStyles.formGroup}>
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={title}
                            onChange={(e) => {
                                // Limit title to 100 characters
                                if (e.target.value.length <= 100) {
                                    setTitle(e.target.value);
                                }
                            }}
                            placeholder="Enter fan title"
                            maxLength={100}
                            disabled={isSubmitting}
                            className={uiStyles.input}
                        />
                        <div className={uiStyles.charCount}>
                            {title.length}/100 characters
                        </div>
                    </div>
                    
                    <div className={uiStyles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) => {
                                // Limit description to 500 characters
                                if (e.target.value.length <= 500) {
                                    setDescription(e.target.value);
                                }
                            }}
                            placeholder="Describe your fan"
                            maxLength={500}
                            rows={3}
                            disabled={isSubmitting}
                            className={uiStyles.textarea}
                        />
                        <div className={uiStyles.charCount}>
                            {description.length}/500 characters
                        </div>
                    </div>
                    
                    {showFanType && (
                        <div className={uiStyles.formGroup}>
                            <label htmlFor="fan_type">Fan Type</label>
                            <select
                                id="fan_type"
                                name="fan_type"
                                value={fanType}
                                onChange={(e) => setFanType(e.target.value)}
                                disabled={isSubmitting}
                                className={uiStyles.input}
                            >
                                <option value="ceiling">Ceiling Fan</option>
                                <option value="table">Table Fan</option>
                                <option value="tower">Tower Fan</option>
                                <option value="box">Box Fan</option>
                                <option value="industrial">Industrial Fan</option>
                                <option value="bladeless">Bladeless Fan</option>
                                <option value="hand">Hand Fan</option>
                                <option value="computer">Computer Cooling Fan</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    )}
                    
                    <div className={uiStyles.formGroup}>
                        {/* Display existing images when editing */}
                        {isEditing && existingMedia.length > 0 && (
                            <div className={styles.existingImagesSection}>
                                <h4>Current Images</h4>
                                <div className={styles.imagePreviewContainer}>
                                    {existingMedia.map((media) => (
                                        <div key={media.id} className={styles.imagePreview}>
                                            <img 
                                                className={styles.previewImage} 
                                                src={media.file_path.startsWith('http') 
                                                    ? media.file_path 
                                                    : `${process.env.REACT_APP_API_URL}/media/${media.file_path}`} 
                                                alt={`Existing ${media.id}`} 
                                            />
                                            <button
                                                type="button"
                                                className={styles.removeImageButton}
                                                onClick={() => removeExistingMedia(media.id)}
                                                disabled={isSubmitting}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <input
                            id="photo-input"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            multiple
                            disabled={isSubmitting}
                            className={styles.visuallyHiddenFileInput}
                        />
                        
                        {isAndroid ? (
                            <button 
                                type="button" 
                                className={styles.uploadButton}
                                onClick={() => fileInputRef.current.click()}
                                disabled={isSubmitting}
                            >
                                <FaImage /> {isEditing ? 'Add More Photos' : 'Add Photos'}
                            </button>
                        ) : (
                            <label htmlFor="photo-input" className={styles.uploadButton}>
                                <FaImage /> {isEditing ? 'Add More Photos' : 'Add Photos'}
                            </label>
                        )}
                        
                        {previewUrls.length > 0 && (
                            <div className={styles.imagePreviewContainer}>
                                <h4>New Images</h4>
                                {previewUrls.map((url, index) => (
                                    <div key={index} className={styles.imagePreview}>
                                        <img className={styles.previewImage} src={url} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className={styles.removeImageButton}
                                            onClick={() => removeFile(index)}
                                            disabled={isSubmitting}
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.formActions}>
                        <button 
                            type="button" 
                            className={styles.cancelButton}
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={!title.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className={animationStyles.spin} /> 
                                    {isEditing ? 'Saving...' : 'Posting...'}
                                </>
                            ) : (
                                isEditing ? 'Save Changes' : 'Post'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostModal;