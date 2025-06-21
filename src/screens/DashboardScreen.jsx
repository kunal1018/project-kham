import React, { useState, useEffect } from 'react'
import { getUserLessons, addUserXP, subscribeToUserProfile } from '../lib/supabase'
import ChamReaction from '../components/ChamReaction'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Badges from '../components/Badges'
import ProgressBar from '../components/ProgressBar'
import XPGoalBar from '../components/XPGoalBar'
import MotivationalToast from '../components/MotivationalToast'
import './DashboardScreen.css'

const DashboardScreen = () => {
  // Hardcoded user data for UI showcase
  const user = { id: "test-user-123", email: "test@example.com" }
  const profile = { 
    id: "test-user-123",
    username: "TestUser", 
    total_xp: 650, 
    current_rank: "Bronze",
    daily_streak: 5,
    last_activity: new Date().toISOString(),
    earned_badges: ['100_xp_club', 'first_lesson', 'streak_master', 'bronze_rank'],
    cham_color: '#CD7F32',
    display_tag: 'WLU',
    customization: {
      cham_color: '#C0C0C0',
      display_tag: 'WLU'
    }
  }
  const loading = false
  const authError = null
  const refreshProfile = async () => { console.log('refreshProfile called (mock)') }
  
  const [userLessons, setUserLessons] = useState([])
  const [loadingLessons, setLoadingLessons] = useState(true)
  const [chamMood, setChamMood] = useState('happy')
  const [chamMessage, setChamMessage] = useState('')
  const [showAnimation, setShowAnimation] = useState(false)
  const [toasts, setToasts] = useState([])
  const [showDuelModal, setShowDuelModal] = useState(false)

  useEffect(() => {
    if (user && profile) {
      fetchUserLessons()
      checkForStreakBonus()
      setChamMoodBasedOnActivity()
    } else if (!loading) {
      setLoadingLessons(false)
    }
  }, [user, profile, loading])

  useEffect(() => {
    let subscription = null
    
    if (user) {
      subscription = subscribeToUserProfile(user.id, (payload) => {
        refreshProfile()
      })
    }
    
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [user])

  // Mock lesson data
  const lessonData = [
    {
      id: 1,
      title: "Variables & Data Types",
      description: "Understand strings, integers, and booleans.",
      icon: "💾",
      difficulty: "Beginner"
    },
    {
      id: 2,
      title: "Loops",
      description: "Practice for, while, and range loops.",
      icon: "🔄",
      difficulty: "Medium"
    },
    {
      id: 3,
      title: "Functions",
      description: "Learn how to define and call functions.",
      icon: "⚙️",
      difficulty: "Medium"
    },
    {
      id: 4,
      title: "Lists & Dictionaries",
      description: "Use collections to store and retrieve data.",
      icon: "📚",
      difficulty: "Hard"
    },
    {
      id: 5,
      title: "Object-Oriented Programming",
      description: "Master classes and objects in Python.",
      icon: "🏗️",
      difficulty: "Hard"
    },
    {
      id: 6,
      title: "Error Handling",
      description: "Learn try-catch and debugging techniques.",
      icon: "🛠️",
      difficulty: "Medium"
    }
  ]

  // Mock duel data
  const mockDuelResults = [
    { opponent: "Anya", result: "Won", xp: "+20 XP", time: "2m 30s" },
    { opponent: "Leo", result: "Lost", xp: "+5 XP", time: "3m 10s" },
    { opponent: "Maya", result: "Won", xp: "+15 XP", time: "1m 45s" },
    { opponent: "Alex", result: "Lost", xp: "+3 XP", time: "4m 20s" },
    { opponent: "Sam", result: "Won", xp: "+25 XP", time: "2m 05s" },
  ]

  const fetchUserLessons = async () => {
    if (!user?.id) {
      console.error('Cannot fetch lessons: user or user.id is missing')
      setLoadingLessons(false)
      return
    }

    try {
      console.log('Fetching user lessons for user ID:', user.id)
      const { data, error } = await getUserLessons(user.id)
      if (error) {
        console.error('Error from getUserLessons:', error)
        throw error
      }
      console.log('Successfully loaded user lessons:', data?.length || 0)
      setUserLessons(data || [])
    } catch (error) {
      console.error('Error fetching user lessons:', {
        message: error.message,
        stack: error.stack,
        userId: user?.id,
        userExists: !!user
      })
      setUserLessons([])
    } finally {
      setLoadingLessons(false)
    }
  }

  const checkForStreakBonus = () => {
    if (profile?.daily_streak >= 3 && profile.daily_streak % 3 === 0) {
      const bonusXP = 5;
      setTimeout(() => {
        showToast(`🔥 ${profile.daily_streak}-day streak bonus!`, 'streak');
        showToast(`+${bonusXP} XP bonus!`, 'xp_bonus');
        handleAddXP(bonusXP);
      }, 1000);
    }
  }

  const setChamMoodBasedOnActivity = () => {
    if (!profile) return;

    const now = new Date();
    const lastActivity = new Date(profile.last_activity);
    const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);

    if (profile.daily_streak >= 7) {
      setChamMood('celebrating');
      setChamMessage('You\'re on fire! 🔥');
    } else if (profile.daily_streak >= 3) {
      setChamMood('proud');
      setChamMessage('Great streak going!');
    } else if (hoursSinceActivity > 24) {
      setChamMood('tired');
      setChamMessage('Ready to code again?');
    } else if (profile.total_xp >= 1000) {
      setChamMood('excited');
      setChamMessage('Coding master!');
    } else {
      setChamMood('happy');
      setChamMessage('Let\'s learn together!');
    }
  }

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }

  const handleAddXP = async (amount) => {
    if (!user) return;

    try {
      await addUserXP(user.id, amount);
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  }

  const simulateLessonComplete = async () => {
    const xpGained = 25;
    setChamMood('celebrating');
    setChamMessage('Amazing work!');
    setShowAnimation(true);
    
    setTimeout(() => {
      showToast('Lesson completed!', 'achievement');
      showToast(`+${xpGained} XP earned!`, 'xp_bonus');
      handleAddXP(xpGained);
    }, 500);

    setTimeout(() => {
      setShowAnimation(false);
      setChamMood('happy');
      setChamMessage('Ready for the next challenge?');
    }, 3000);
  }

  const handleLessonClick = (lesson) => {
    setChamMood('excited')
    setChamMessage(`Let's learn ${lesson.title}!`)
    setShowAnimation(true)
    
    setTimeout(() => {
      showToast(`Starting "${lesson.title}" lesson!`, 'achievement')
      showToast(`Get ready to earn XP!`, 'encouragement')
    }, 500)

    setTimeout(() => {
      setShowAnimation(false)
      setChamMood('happy')
      setChamMessage('Ready for your next challenge?')
    }, 3000)
  }

  const handleDuelClick = () => {
    setChamMood('excited')
    setChamMessage('Time to duel!')
    setShowDuelModal(true)
    showToast('Ready to challenge your friends?', 'encouragement')
  }

  if (loading || loadingLessons) {
    return (
      <div className="dashboard-screen">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <ChamReaction mood="thinking" message="Loading your progress..." size="large" />
            <h1 className="welcome-text">Loading ChamCode...</h1>
          </div>
        </div>
      </div>
    )
  }

  const totalLessons = 6
  const completedLessons = userLessons.length

  return (
    <div className="dashboard-screen">
      <div className="dashboard-content">
        {/* Header with Enhanced Mascot */}
        <div className="dashboard-header">
          <ChamReaction 
            mood={chamMood} 
            message={chamMessage}
            size="large" 
            showAnimation={showAnimation}
          />
          <h1 className="welcome-text">Welcome back, {profile?.username || 'Coder'}!</h1>
        </div>

        {/* Stats Card */}
        <div className="stats-card">
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-value">{profile?.total_xp || 0}</div>
              <div className="stat-label">Total XP</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <Badge rank={profile?.current_rank || 'Bronze'} />
              <div className="stat-label">Current Rank</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">{profile?.daily_streak || 0}</div>
              <div className="stat-label-streak">🔥 Day Streak</div>
            </div>
          </div>
        </div>

        {/* XP Goal Progress */}
        <XPGoalBar 
          currentXP={profile?.total_xp || 0}
          currentRank={profile?.current_rank || 'Bronze'}
        />

        {/* Lesson Carousel Section */}
        <div className="lesson-carousel-section">
          <div className="carousel-header">
            <h2 className="carousel-title">📚 Continue Learning</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="lesson-carousel-container">
            <div className="lesson-carousel">
              {/* Duplicate the array to create seamless loop */}
              {[...lessonData, ...lessonData].map((lesson, index) => (
                <div 
                  key={`${lesson.id}-${index}`} 
                  className="lesson-card"
                  onClick={() => handleLessonClick(lesson)}
                >
                  <div className="lesson-card-content">
                    <div>
                      <div className="lesson-icon-placeholder">
                        {lesson.icon}
                      </div>
                      <h3 className="lesson-title">{lesson.title}</h3>
                      <p className="lesson-description">{lesson.description}</p>
                    </div>
                    <div className="lesson-footer">
                      <span className="lesson-difficulty">{lesson.difficulty}</span>
                      <button className="lesson-start-btn">Start</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Duel with Friends Section */}
        <div className="duel-section">
          <div className="duel-card">
            <div className="duel-header">
              <h2 className="duel-title">⚔️ Duel with Friends</h2>
              <div className="duel-icon">🏆</div>
            </div>
            <p className="duel-description">
              Challenge your friends to coding duels and climb the leaderboard together!
            </p>
            <button className="duel-button" onClick={handleDuelClick}>
              Start Duel Challenge
            </button>
          </div>
        </div>

        {/* Badges Section */}
        {profile?.earned_badges && profile.earned_badges.length > 0 && (
          <div className="card">
            <h2 className="card-title">🏅 Your Achievements</h2>
            <div className="badges-grid">
              {profile.earned_badges.slice(0, 4).map((badgeType, index) => (
                <Badges key={index} badgeType={badgeType} size="small" />
              ))}
            </div>
            {profile.earned_badges.length > 4 && (
              <div className="badges-more">
                +{profile.earned_badges.length - 4} more badges
              </div>
            )}
          </div>
        )}

        {/* Quick Actions Card */}
        <div className="quick-actions-section">
          <h2 className="section-title">🎯 Quick Actions</h2>
          <div className="quick-actions">
            <div className="action-card" onClick={simulateLessonComplete}>
              <div className="action-emoji">📝</div>
              <div className="action-text">Next Lesson</div>
              <div className="action-subtext">
                {completedLessons < totalLessons ? 'Ready to start' : 'All complete!'}
              </div>
            </div>
            <div className="action-card">
              <div className="action-emoji">🎯</div>
              <div className="action-text">Daily Goal</div>
              <div className="action-subtext">Keep the streak!</div>
            </div>
          </div>
        </div>

        {/* Achievement Card */}
        {completedLessons > 0 && (
          <div className="achievement-card">
            <div className="achievement-header">
              <div className="achievement-emoji">🏆</div>
              <div>
                <h3 className="achievement-title">Great Progress!</h3>
                <p className="achievement-text">Completed {completedLessons} lessons</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Duel Results Modal */}
      {showDuelModal && (
        <div className="duel-modal-overlay" onClick={() => setShowDuelModal(false)}>
          <div className="duel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="duel-modal-header">
              <h2 className="duel-modal-title">⚔️ Recent Duels</h2>
              <button className="close-btn" onClick={() => setShowDuelModal(false)}>×</button>
            </div>
            <div className="duel-results">
              {mockDuelResults.map((duel, index) => (
                <div key={index} className={`duel-result-item ${duel.result.toLowerCase()}`}>
                  <div className="result-info">
                    <div className="result-opponent">vs {duel.opponent}</div>
                    <div className="result-time">{duel.time}</div>
                  </div>
                  <div className="result-outcome">
                    <span className={`result-status ${duel.result.toLowerCase()}`}>
                      {duel.result}
                    </span>
                    <span className="result-xp">{duel.xp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
  )
}

export default DashboardScreen