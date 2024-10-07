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
const Button = ({ onClick, children, className, type = 'button' }) => (
  <button 
    onClick={onClick} 
    className={`button ${className}`}
    type={type}
  >
    {children}
  </button>
);

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;