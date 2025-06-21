import React from 'react';
import './Badge.css';

const Badge = ({ rank, size = 'medium' }) => {
  const getBadgeColor = () => {
    switch (rank.toLowerCase()) {
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      case 'bronze':
        return '#CD7F32';
      default:
        return '#9E9E9E';
    }
  };

  const getBadgeEmoji = () => {
    switch (rank.toLowerCase()) {
      case 'gold':
        return '🏆';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '🏅';
    }
  };

  return (
    <div 
      className={`badge ${size}`}
      style={{ backgroundColor: getBadgeColor() }}
    >
      <span className="badge-emoji">{getBadgeEmoji()}</span>
      <span className="badge-text">{rank}</span>
    </div>
  );
};

export default Badge;