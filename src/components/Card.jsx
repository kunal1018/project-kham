import React from 'react';
import './Card.css';

const Card = ({ children, onClick, disabled = false, className = '', style = {} }) => {
  const CardComponent = onClick ? 'button' : 'div';
  
  return (
    <CardComponent
      className={`card ${disabled ? 'disabled' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </CardComponent>
  );
};

export default Card;