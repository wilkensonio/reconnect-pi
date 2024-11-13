import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Button.css';

/**
 * Reusable Button component
 * @param {Object} props - The component props
 * @param {Function} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type (default: 'button')
 */
const Button = ({ onClick, children, className = '', type = 'button' }) => {
  // Detect specific button types from className
  const isFacultyChange = className?.includes('change-faculty-button') || 
                         className?.includes('back-button');
  const isFullWidth = className?.includes('full-width-button');
  const isLarge = className?.includes('large-button');
  const isDanger = className?.includes('cancel-button');

  const buttonClasses = [
    'button',
    isFacultyChange && 'button--faculty-change',
    isFullWidth && 'button--full-width',
    isLarge && 'button--large',
    isDanger && 'button--danger',
    className // Keep original classes for any additional styling
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      type={type}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button;