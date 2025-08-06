import React from 'react';
import PropTypes from 'prop-types';

/**
 * Avatar component that displays a user's profile image or a placeholder
 * 
 * @param {Object} props Component props
 * @param {string|null} props.src The source URL of the image
 * @param {string} props.alt Alternative text for the image
 * @param {string} props.className CSS class name for styling
 * @param {number} props.size Size of the avatar in pixels (used for placeholder)
 * @param {string} props.username Username for generating placeholder
 * @param {function} props.onClick Click handler function
 * @returns {JSX.Element} Avatar component
 */
const Avatar = ({ 
  src, 
  alt, 
  className, 
  size = 40, 
  username = '', 
  onClick 
}) => {
  // Generate a placeholder URL using the username or a random color if no username
  const generatePlaceholder = () => {
    const name = username || alt || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=${size}`;
  };

  // Use the provided image source or fall back to a placeholder
  const imageSrc = src || generatePlaceholder();

  return (
    <img
      src={imageSrc}
      alt={alt || 'User avatar'}
      className={className}
      onClick={onClick}
    />
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.number,
  username: PropTypes.string,
  onClick: PropTypes.func
};

export default Avatar;