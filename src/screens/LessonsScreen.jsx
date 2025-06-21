import React, { useState } from 'react';
import Card from '../components/Card';
import ChamReaction from '../components/ChamReaction';
import MotivationalToast from '../components/MotivationalToast';
import './LessonsScreen.css';

const LessonsScreen = () => {
  const [chamMood, setChamMood] = useState('thinking');
  const [chamMessage, setChamMessage] = useState('Choose your challenge!');
  const [toasts, setToasts] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([1, 2]); // Mock completed lessons

  const lessons = [
    {
      id: 1,
      type: 'Multiple Choice',
      title: 'Python Variables',
      description: 'Learn about variable types and declarations',
      xp: 25,
      difficulty: 'Beginner',
      locked: false,
      icon: '📝',
      color: '#34D399',
      completed: true,
    },
    {
      id: 2,
      type: 'Fill in the Blank',
      title: 'Function Returns',
      description: 'Master function return statements',
      xp: 35,
      difficulty: 'Medium',
      locked: false,
      icon: '✏️',
      color: '#60A5FA',
      completed: true,
    },
    {
      id: 3,
      type: 'Syntax Practice',
      title: 'For Loops',
      description: 'Practice loop syntax and iteration',
      xp: 45,
      difficulty: 'Hard',
      locked: false,
      icon: '🔄',
      color: '#FF7F6B',
      completed: false,
    },
    {
      id: 4,
      type: 'Multiple Choice',
      title: 'Conditional Statements',
      description: 'Master if-else logic',
      xp: 30,
      difficulty: 'Beginner',
      locked: true,
      icon: '🤔',
      color: '#A78BFA',
      completed: false,
    },
    {
      id: 5,
      type: 'Fill in the Blank',
      title: 'Data Structures',
      description: 'Learn about lists and dictionaries',
      xp: 40,
      difficulty: 'Medium',
      locked: true,
      icon: '📚',
      color: '#60A5FA',
      completed: false,
    },
    {
      id: 6,
      type: 'Syntax Practice',
      title: 'Object-Oriented Programming',
      description: 'Introduction to classes and objects',
      xp: 50,
      difficulty: 'Hard',
      locked: true,
      icon: '🏗️',
      color: '#FF7F6B',
      completed: false,
    },
  ];

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleLessonClick = (lesson) => {
    if (lesson.locked) {
      setChamMood('confused');
      setChamMessage('Complete previous lessons first!');
      showToast('Complete previous lessons to unlock this one!', 'encouragement');
      
      setTimeout(() => {
        setChamMood('encouraging');
        setChamMessage('You can do it!');
      }, 2000);
      
      return;
    }

    if (lesson.completed) {
      setChamMood('proud');
      setChamMessage('Already mastered this one!');
      showToast('Lesson already completed! Great job!', 'achievement');
      return;
    }

    // Simulate lesson start
    setChamMood('excited');
    setChamMessage(`Let's tackle ${lesson.title}!`);
    
    const confirmed = window.confirm(
      `Ready to begin "${lesson.title}"? You'll earn ${lesson.xp} XP!`
    );
    
    if (confirmed) {
      // Simulate lesson completion
      setTimeout(() => {
        setChamMood('celebrating');
        setChamMessage('Outstanding work!');
        showToast(`Lesson "${lesson.title}" completed!`, 'achievement');
        showToast(`+${lesson.xp} XP earned!`, 'xp_bonus');
        
        // Add motivational messages
        const motivationalMessages = [
          "Cham's impressed! 🦎",
          "One loop at a time! 🦎",
          "Code like a chameleon! 🦎",
          "Adapting and learning! 🦎",
          "You're evolving! 🦎"
        ];
        
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        setTimeout(() => {
          showToast(randomMessage, 'encouragement');
        }, 1500);
        
        // Mark lesson as completed
        setCompletedLessons(prev => [...prev, lesson.id]);
        
      }, 1000);
    } else {
      setChamMood('thinking');
      setChamMessage('Take your time, I\'ll be here!');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'var(--color-difficulty-beginner)';
      case 'medium':
        return 'var(--color-difficulty-medium)';
      case 'hard':
        return 'var(--color-difficulty-hard)';
      default:
        return 'var(--color-difficulty-beginner)';
    }
  };

  const getNextLesson = () => {
    return lessons.find(lesson => !lesson.completed && !lesson.locked);
  };

  const nextLesson = getNextLesson();

  return (
    <div className="lessons-screen">
      <div className="lessons-content">
        {/* Header */}
        <div className="lessons-header">
          <ChamReaction 
            mood={chamMood} 
            message={chamMessage}
            size="small" 
          />
        </div>

        {/* Lesson Path Visualization */}
        <div className="lesson-path">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isNext = nextLesson && nextLesson.id === lesson.id;
            const isLocked = lesson.locked && !isCompleted;
            
            return (
              <div key={lesson.id} className="lesson-path-item">
                {index > 0 && (
                  <div className={`path-connector ${isCompleted || completedLessons.includes(lessons[index - 1].id) ? 'completed' : 'locked'}`} />
                )}
                
                <Card
                  onClick={() => handleLessonClick({ ...lesson, completed: isCompleted, locked: isLocked })}
                  disabled={isLocked}
                  className={`lesson-card ${isLocked ? 'locked-card' : ''} ${isNext ? 'next-lesson' : ''} ${isCompleted ? 'completed-lesson' : ''}`}
                >
                  <div className="lesson-header">
                    <div className="lesson-icon-container">
                      <div 
                        className="lesson-icon"
                        style={{ 
                          filter: isLocked ? 'grayscale(100%) opacity(0.5)' : 'none',
                          color: lesson.color 
                        }}
                      >
                        {lesson.icon}
                      </div>
                      {isLocked && (
                        <div className="lock-overlay">
                          <span className="lock-icon">🔒</span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="completed-overlay">
                          <span className="completed-icon">✅</span>
                        </div>
                      )}
                      {isNext && (
                        <div className="next-indicator">
                          <span className="next-icon">▶️</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="lesson-info">
                      <div className="lesson-title-row">
                        <h3 className={`lesson-title ${isLocked ? 'locked-text' : ''} ${isCompleted ? 'completed-text' : ''}`}>
                          {lesson.title}
                        </h3>
                        <div 
                          className="difficulty-badge"
                          style={{ backgroundColor: getDifficultyColor(lesson.difficulty) }}
                        >
                          <span className="difficulty-text">{lesson.difficulty}</span>
                        </div>
                      </div>
                      
                      <div className="lesson-type" style={{ color: isLocked ? '#999' : lesson.color }}>
                        {lesson.type}
                      </div>
                      
                      <p className={`lesson-description ${isLocked ? 'locked-text' : ''}`}>
                        {lesson.description}
                      </p>
                      
                      <div className="lesson-footer">
                        <div className="xp-container">
                          <span className="star-icon">⭐</span>
                          <span className="xp-text">{lesson.xp} XP</span>
                        </div>
                        
                        {!isLocked && !isCompleted && (
                          <button 
                            className="start-button"
                            style={{ backgroundColor: lesson.color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick({ ...lesson, completed: isCompleted, locked: isLocked });
                            }}
                          >
                            {isNext ? 'Continue' : 'Start'}
                          </button>
                        )}
                        
                        {isCompleted && (
                          <div className="completed-badge">
                            <span className="completed-text">Completed!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mascot Reaction */}
                  {!isLocked && (
                    <div className="mascot-reaction">
                      <div className="reaction-text">
                        {isCompleted && "🦎 Well done!"}
                        {!isCompleted && lesson.difficulty === 'Beginner' && "🦎 Great for starters!"}
                        {!isCompleted && lesson.difficulty === 'Medium' && "🦎 Good challenge!"}
                        {!isCompleted && lesson.difficulty === 'Hard' && "🦎 You got this!"}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <Card className="summary-card">
          <div className="summary-header">
            <h2 className="summary-title">Your Progress</h2>
            <div className="summary-emoji">📈</div>
          </div>
          <div className="summary-stats">
            <div className="summary-item">
              <div className="summary-value">{completedLessons.length}/{lessons.length}</div>
              <div className="summary-label">Completed</div>
            </div>
            <div className="summary-divider" />
            <div className="summary-item">
              <div className="summary-value">
                {lessons.reduce((total, lesson) => 
                  completedLessons.includes(lesson.id) ? total + lesson.xp : total, 0
                )}
              </div>
              <div className="summary-label">XP Earned</div>
            </div>
            <div className="summary-divider" />
            <div className="summary-item">
              <div className="summary-value">
                {lessons.length - completedLessons.length}
              </div>
              <div className="summary-label">Remaining</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Motivational Toasts */}
      {toasts.map(toast => (
        <MotivationalToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default LessonsScreen;