import React, { useState, useEffect } from 'react';
import './MotivationalToast.css';

const MotivationalToast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastData = () => {
    switch (type) {
      case 'xp_bonus':
        return {
          icon: '⭐',
          bgColor: '#FFD700',
          textColor: '#333'
        };
      case 'streak':
        return {
          icon: '🔥',
          bgColor: '#FF5722',
          textColor: 'white'
        };
      case 'achievement':
        return {
          icon: '🏆',
          bgColor: '#4CAF50',
          textColor: 'white'
        };
      case 'encouragement':
        return {
          icon: '💪',
          bgColor: '#2196F3',
          textColor: 'white'
        };
      default:
        return {
          icon: '✨',
          bgColor: '#4CAF50',
          textColor: 'white'
        };
    }
  };

  const toastData = getToastData();

  return (
    <div className={`motivational-toast ${isVisible ? 'visible' : 'hidden'}`}>
      <div 
        className="toast-content"
        style={{ 
          backgroundColor: toastData.bgColor,
          color: toastData.textColor 
        }}
      >
        <span className="toast-icon">{toastData.icon}</span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default MotivationalToast;