import React from 'react';
import './Badges.css';

const Badges = ({ badgeType, size = 'medium' }) => {
  const getBadgeData = () => {
    switch (badgeType) {
      case '100_xp_club':
        return {
          emoji: '💯',
          title: '100 XP Club',
          color: '#4CAF50',
          description: 'Earned 100+ XP'
        };
      case 'first_lesson':
        return {
          emoji: '🎓',
          title: 'First Steps',
          color: '#2196F3',
          description: 'Completed first lesson'
        };
      case 'weekly_winner':
        return {
          emoji: '👑',
          title: 'Weekly Champion',
          color: '#FFD700',
          description: 'Top performer this week'
        };
      case 'streak_master':
        return {
          emoji: '🔥',
          title: 'Streak Master',
          color: '#FF5722',
          description: '7+ day streak'
        };
      case 'speed_demon':
        return {
          emoji: '⚡',
          title: 'Speed Demon',
          color: '#9C27B0',
          description: 'Completed lesson in under 2 minutes'
        };
      case 'perfectionist':
        return {
          emoji: '⭐',
          title: 'Perfectionist',
          color: '#FF9800',
          description: '100% score on 5 lessons'
        };
      case 'challenger':
        return {
          emoji: '⚔️',
          title: 'Challenger',
          color: '#F44336',
          description: 'Won 3 duels'
        };
      case 'bronze_rank':
        return {
          emoji: '🥉',
          title: 'Bronze Coder',
          color: '#CD7F32',
          description: 'Reached Bronze rank'
        };
      case 'silver_rank':
        return {
          emoji: '🥈',
          title: 'Silver Coder',
          color: '#C0C0C0',
          description: 'Reached Silver rank'
        };
      case 'gold_rank':
        return {
          emoji: '🥇',
          title: 'Gold Coder',
          color: '#FFD700',
          description: 'Reached Gold rank'
        };
      default:
        return {
          emoji: '🏅',
          title: 'Achievement',
          color: '#9E9E9E',
          description: 'Special achievement'
        };
    }
  };

  const badge = getBadgeData();

  return (
    <div className={`badge-container ${size}`}>
      <div 
        className="badge-icon"
        style={{ backgroundColor: badge.color }}
      >
        <span className="badge-emoji">{badge.emoji}</span>
      </div>
      <div className="badge-info">
        <div className="badge-title">{badge.title}</div>
        {size !== 'small' && (
          <div className="badge-description">{badge.description}</div>
        )}
      </div>
    </div>
  );
};

export default Badges;