import React, { useState } from 'react';
import './DuelChallenge.css';

const DuelChallenge = ({ targetUser, onClose, onComplete }) => {
  const [stage, setStage] = useState('challenge'); // challenge, fighting, result
  const [result, setResult] = useState(null);

  const startDuel = () => {
    setStage('fighting');
    
    // Simulate duel with random outcome
    setTimeout(() => {
      const outcomes = [
        { won: true, xp: 15, message: 'Victory! Your coding skills prevailed!' },
        { won: true, xp: 10, message: 'Close match, but you pulled through!' },
        { won: false, xp: 5, message: 'Good effort! You still earned some XP.' },
        { won: false, xp: 3, message: 'Better luck next time, keep practicing!' }
      ];
      
      const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      setResult(randomOutcome);
      setStage('result');
      
      // Auto-close after showing result
      setTimeout(() => {
        onComplete(randomOutcome);
        onClose();
      }, 3000);
    }, 2000);
  };

  return (
    <div className="duel-overlay" onClick={onClose}>
      <div className="duel-modal" onClick={(e) => e.stopPropagation()}>
        {stage === 'challenge' && (
          <>
            <div className="duel-header">
              <h2>⚔️ Code Duel Challenge</h2>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="duel-content">
              <div className="challenge-info">
                <div className="challenger-vs">
                  <div className="challenger">
                    <div className="user-avatar">🦎</div>
                    <div className="user-name">You</div>
                  </div>
                  <div className="vs-text">VS</div>
                  <div className="opponent">
                    <div className="user-avatar">👤</div>
                    <div className="user-name">{targetUser.username}</div>
                  </div>
                </div>
                <div className="duel-description">
                  <p>Challenge <strong>{targetUser.username}</strong> to a 3-question coding duel!</p>
                  <div className="duel-rules">
                    <div className="rule">🎯 3 coding questions</div>
                    <div className="rule">⏱️ 60 seconds each</div>
                    <div className="rule">🏆 Winner takes XP</div>
                  </div>
                </div>
              </div>
              <button className="start-duel-btn" onClick={startDuel}>
                Start Duel!
              </button>
            </div>
          </>
        )}

        {stage === 'fighting' && (
          <div className="duel-fighting">
            <div className="fighting-header">
              <h2>🔥 Duel in Progress</h2>
            </div>
            <div className="fighting-animation">
              <div className="code-battle">
                <div className="code-line">{'<div className="battle">'}</div>
                <div className="code-line">{'  const winner = fight();'}</div>
                <div className="code-line">{'</div>'}</div>
              </div>
              <div className="loading-text">Calculating results...</div>
            </div>
          </div>
        )}

        {stage === 'result' && result && (
          <div className="duel-result">
            <div className="result-header">
              <h2>{result.won ? '🎉 Victory!' : '😅 Good Try!'}</h2>
            </div>
            <div className="result-content">
              <div className="result-message">{result.message}</div>
              <div className="xp-reward">
                <span className="xp-icon">⭐</span>
                <span className="xp-amount">+{result.xp} XP</span>
              </div>
              <div className="result-footer">
                <div className="auto-close">Closing automatically...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuelChallenge;