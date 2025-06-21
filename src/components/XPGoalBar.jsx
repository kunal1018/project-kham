import React from 'react';
import ProgressBar from './ProgressBar';
import './XPGoalBar.css';

const XPGoalBar = ({ currentXP, currentRank }) => {
  const getRankThresholds = () => {
    return {
      'Bronze': { min: 0, max: 999, next: 'Silver' },
      'Silver': { min: 1000, max: 2499, next: 'Gold' },
      'Gold': { min: 2500, max: Infinity, next: 'Legend' }
    };
  };

  const thresholds = getRankThresholds();
  const currentThreshold = thresholds[currentRank] || thresholds['Bronze'];
  
  const xpInCurrentRank = currentXP - currentThreshold.min;
  const xpNeededForRank = currentThreshold.max === Infinity ? 
    1000 : (currentThreshold.max + 1 - currentThreshold.min);
  const xpToNext = currentThreshold.max === Infinity ? 
    0 : (currentThreshold.max + 1 - currentXP);

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Legend': return '#FF6B6B';
      default: return '#CD7F32';
    }
  };

  if (currentRank === 'Gold' && currentXP >= 2500) {
    return (
      <div className="xp-goal-container">
        <div className="goal-header">
          <span className="goal-icon">👑</span>
          <span className="goal-text">Maximum Rank Achieved!</span>
        </div>
        <div className="max-rank-message">
          You've reached the highest rank! Keep learning to maintain your status.
        </div>
      </div>
    );
  }

  return (
    <div className="xp-goal-container">
      <div className="goal-header">
        <span className="goal-icon">🎯</span>
        <span className="goal-text">
          {xpToNext} XP to {currentThreshold.next}
        </span>
      </div>
      
      <ProgressBar 
        progress={xpInCurrentRank}
        total={xpNeededForRank}
        color={getRankColor(currentThreshold.next)}
        showText={false}
      />
      
      <div className="goal-details">
        <span className="current-progress">
          {xpInCurrentRank} / {xpNeededForRank} XP
        </span>
        <span className="next-rank" style={{ color: getRankColor(currentThreshold.next) }}>
          {currentThreshold.next} Rank
        </span>
      </div>
    </div>
  );
};

export default XPGoalBar;