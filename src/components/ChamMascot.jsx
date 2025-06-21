import React from 'react';
import './ChamMascot.css';

const ChamMascot = ({ mood = 'happy', size = 'large' }) => {
  const getMoodEmoji = () => {
    switch (mood) {
      case 'excited':
        return '🦎✨';
      case 'thinking':
        return '🦎🤔';
      case 'celebrating':
        return '🦎🎉';
      default:
        return '🦎😊';
    }
  };

  return (
    <div className={`cham-mascot ${size}`}>
      <div className="mascot-emoji">{getMoodEmoji()}</div>
      <div className="mascot-name">Cham</div>
    </div>
  );
};

export default ChamMascot;