import React, { useState, useRef, useEffect } from 'react';
import { FaSpinner, FaImage, FaTimes, FaPlus } from 'react-icons/fa';
import styles from './PostModal.module.css';
import uiStyles from './UI.module.css';
import animationStyles from './Animations.module.css';

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
    onSubmit,
    isEditing = false,
    initialValues = {
        title: '',
        description: '',
        fan_type: 'ceiling',
        media: []
    },
    isSubmitting = false,
    error = '',
    success = '',
    showFanType = true
}) => {
    // Form state
    const [title, setTitle] = useState(initialValues.title || '');
    const [description, setDescription] = useState(initialValues.description || '');
    const [fanType, setFanType] = useState(initialValues.fan_type || 'ceiling');
    
    // Image upload state
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const fileInputRef = useRef(null);

    // Update form values when initialValues change
    useEffect(() => {
        setTitle(initialValues.title || '');
        setDescription(initialValues.description || '');
        setFanType(initialValues.fan_type || 'ceiling');
    }, [initialValues]);

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
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!title.trim()) {
            return;
        }
        
        // Prepare form data
        const formData = {
            title,
            description,
            fan_type: fanType,
            selectedFiles
        };
        
        // Call onSubmit callback
        onSubmit(formData);
    };

    // Handle file selection
    const handleFileSelect = (e) => {
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
        
        // Create preview URLs using FileReader for better mobile compatibility
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    setPreviewUrls(prev => [...prev, event.target.result.toString()]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Remove a selected file
    const removeFile = (index) => {
        // Simply remove the file and preview URL from state
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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
                        <label htmlFor="photo-input" className={styles.uploadButton}>
                            <FaImage /> Add Photos
                        </label>
                        
                        {previewUrls.length > 0 && (
                            <div className={styles.imagePreviewContainer}>
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