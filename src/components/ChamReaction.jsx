import React, { useState, useEffect } from 'react';
import './ChamReaction.css';

const ChamReaction = ({ mood = 'happy', message = '', size = 'large', showAnimation = false }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showAnimation) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, mood]);

  const getMoodData = () => {
    switch (mood) {
      case 'celebrating':
        return {
          emoji: '🦎🎉',
          color: '#FFD700',
          defaultMessage: 'Amazing work!'
        };
      case 'excited':
        return {
          emoji: '🦎✨',
          color: '#FF6B6B',
          defaultMessage: 'Let\'s code!'
        };
      case 'thinking':
        return {
          emoji: '🦎🤔',
          color: '#4ECDC4',
          defaultMessage: 'Hmm, interesting...'
        };
      case 'confused':
        return {
          emoji: '🦎😵',
          color: '#FFA726',
          defaultMessage: 'That\'s tricky!'
        };
      case 'tired':
        return {
          emoji: '🦎😴',
          color: '#9E9E9E',
          defaultMessage: 'Time to wake up!'
        };
      case 'proud':
        return {
          emoji: '🦎😎',
          color: '#8BC34A',
          defaultMessage: 'You\'re crushing it!'
        };
      case 'encouraging':
        return {
          emoji: '🦎💪',
          color: '#2196F3',
          defaultMessage: 'Keep going!'
        };
      default:
        return {
          emoji: '🦎😊',
          color: '#4CAF50',
          defaultMessage: 'Ready to learn!'
        };
    }
  };

  const moodData = getMoodData();
  const displayMessage = message || moodData.defaultMessage;

  return (
    <div className={`cham-reaction ${size} ${isAnimating ? 'animating' : ''}`}>
      <div 
        className="reaction-mascot"
        style={{ color: moodData.color }}
      >
        {moodData.emoji}
      </div>
      {displayMessage && (
        <div className="reaction-message" style={{ color: moodData.color }}>
          {displayMessage}
        </div>
      )}
    </div>
  );
};

export default ChamReaction;