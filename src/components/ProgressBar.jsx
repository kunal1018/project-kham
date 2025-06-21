import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, total, color = '#4CAF50', showText = true }) => {
  const percentage = Math.min((progress / total) * 100, 100);

  return (
    <div className="progress-container">
      {showText && (
        <div className="progress-text">
          {progress} / {total} lessons completed
        </div>
      )}
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {showText && (
        <div className="progress-percentage">{Math.round(percentage)}%</div>
      )}
    </div>
  );
};

export default ProgressBar;