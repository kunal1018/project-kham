import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Badges from '../components/Badges';
import DuelChallenge from '../components/DuelChallenge';
import FriendRequestModal from '../components/FriendRequestModal';
import MotivationalToast from '../components/MotivationalToast';
import { 
  getGlobalLeaderboard, 
  getFriendsList, 
  getUserRankPosition,
  subscribeToLeaderboardChanges,
  subscribeToFriendRequests,
  unsubscribeFromFriendRequests,
  createDuel,
  completeDuel
} from '../lib/supabase';
import './LeaderboardScreen.css';

const LeaderboardScreen = () => {
  // Hardcoded user data for UI showcase
  const user = { id: "test-user-123", email: "test@example.com" }
  const profile = { 
    id: "test-user-123",
    username: "TestUser", 
    total_xp: 350, 
    current_rank: "Silver",
    daily_streak: 5,
    last_activity: new Date().toISOString(),
    earned_badges: ['100_xp_club', 'first_lesson', 'streak_master', 'bronze_rank'],
    cham_color: '#C0C0C0',
    display_tag: 'WLU'
  }
  const loading = false
  const authError = null

  const [activeTab, setActiveTab] = useState('Global');
  const [timePeriod, setTimePeriod] = useState('all');
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState([]);
  const [userRankPosition, setUserRankPosition] = useState(0);
  const [selectedDuelTarget, setSelectedDuelTarget] = useState(null);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const leaderboardSubscriptionRef = useRef(null);
  const friendRequestsSubscriptionRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      if (user) {
        fetchLeaderboardData();
        setupRealTimeSubscriptions();
      } else {
        setLoadingData(false);
      }
    }

    return () => {
      if (leaderboardSubscriptionRef.current) {
        leaderboardSubscriptionRef.current.unsubscribe();
      }
      if (friendRequestsSubscriptionRef.current) {
        unsubscribeFromFriendRequests(user?.id);
      }
    };
  }, [user, loading, timePeriod]);

  const fetchLeaderboardData = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingData(true);
    }
    setError(null);
    
    try {
      console.log('Fetching leaderboard data...');
      
      const { data: globalData, error: globalError } = await getGlobalLeaderboard(50);
      if (globalError) {
        console.error('Global leaderboard error:', globalError);
        throw globalError;
      }
      console.log('Global leaderboard data:', globalData);
      setGlobalLeaderboard(globalData || []);

      await fetchFriendsList();

      const { data: rankData, error: rankError } = await getUserRankPosition(user.id);
      if (rankError) {
        console.error('User rank error:', rankError);
      }
      console.log('User rank data:', rankData);
      setUserRankPosition(rankData || 0);

    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setError(error.message);
      showToast('Error loading leaderboard data', 'encouragement');
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  const fetchFriendsList = async () => {
    if (!user) return;

    try {
      const { data: friendsData, error: friendsError } = await getFriendsList(user.id);
      if (friendsError) {
        console.error('Friends leaderboard error:', friendsError);
      }
      console.log('Friends leaderboard data:', friendsData);
      
      const processedFriends = (friendsData || []).map((friend, index) => ({
        ...friend,
        position: index + 1,
        cham_color: getChamColorByXP(friend.total_xp),
        earned_badges: getEarnedBadges(friend.total_xp, friend.current_rank)
      }));
      
      setFriendsLeaderboard(processedFriends);
    } catch (error) {
      console.error('Error fetching friends list:', error);
      setFriendsLeaderboard([]);
    }
  };

  const getChamColorByXP = (xp) => {
    if (xp >= 2500) return '#FFD700'; // Gold
    if (xp >= 1000) return '#C0C0C0'; // Silver
    return '#CD7F32'; // Bronze
  };

  const getEarnedBadges = (xp, rank) => {
    const badges = [];
    if (xp >= 100) badges.push('100_xp_club');
    if (xp >= 25) badges.push('first_lesson');
    if (rank === 'Bronze') badges.push('bronze_rank');
    if (rank === 'Silver') badges.push('silver_rank');
    if (rank === 'Gold') badges.push('gold_rank');
    return badges;
  };

  const setupRealTimeSubscriptions = () => {
    if (!user) return;

    try {
      if (!leaderboardSubscriptionRef.current) {
        leaderboardSubscriptionRef.current = subscribeToLeaderboardChanges(() => {
          console.log('Leaderboard changed, refreshing...');
          fetchLeaderboardData();
        });
      }

      if (!friendRequestsSubscriptionRef.current) {
        friendRequestsSubscriptionRef.current = subscribeToFriendRequests(user.id, () => {
          showToast('New friend request received!', 'achievement');
        });
      }
    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleDuelChallenge = async (targetUser) => {
    if (!user) return;

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    try {
      const { data: duelData, error: duelError } = await createDuel(user.id, targetUser.id);
      if (duelError) throw duelError;

      setSelectedDuelTarget({ ...targetUser, duelId: duelData.id });
    } catch (error) {
      console.error('Error creating duel:', error);
      showToast('Error starting duel', 'encouragement');
    }
  };

  const handleDuelComplete = async (result) => {
    if (!selectedDuelTarget || !user) return;

    try {
      const winnerId = result.won ? user.id : selectedDuelTarget.id;
      const { data: duelResult, error: duelError } = await completeDuel(
        selectedDuelTarget.duelId,
        winnerId,
        result.xp
      );

      if (duelError) throw duelError;

      if (result.won) {
        showToast(`Duel won! +${result.xp} XP`, 'achievement');
      } else {
        showToast(`Good effort! +${duelResult.loser_xp} XP`, 'encouragement');
      }

      fetchLeaderboardData();

    } catch (error) {
      console.error('Error completing duel:', error);
      showToast('Error completing duel', 'encouragement');
    }
  };

  const handleFriendAdded = () => {
    fetchLeaderboardData();
    showToast('Friend added successfully!', 'achievement');
  };

  const handleShare = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }

    if (navigator.share) {
      navigator.share({
        title: 'ChamCode Leaderboard',
        text: `Check out my ranking on ChamCode! I'm #${userRankPosition} with ${profile?.total_xp || 0} XP.`,
        url: window.location.href,
      });
    } else {
      const text = `Check out my ranking on ChamCode! I'm #${userRankPosition} with ${profile?.total_xp || 0} XP. ${window.location.href}`;
      navigator.clipboard.writeText(text);
      showToast('Link copied to clipboard!', 'success');
    }
  }, [userRankPosition, profile?.total_xp]);

  const handleRefresh = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    fetchLeaderboardData(true);
  }, [user]);

  const getRankEmoji = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈'; 
      case 3: return '🥉';
      default: return position.toString();
    }
  };

  const getAvatarColor = (user) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
      '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ];
    const index = user.id ? user.id.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getPlayerAvatar = (user) => {
    return user.username ? user.username.charAt(0).toUpperCase() : '?';
  };

  if (loading || loadingData) {
    return (
      <div className="leaderboard-screen">
        <div className="leaderboard-nav">
          <div className="nav-header">
            <h1 className="nav-title">Leaderboard</h1>
          </div>
        </div>
        
        <div className="leaderboard-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading rankings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-screen">
        <div className="leaderboard-nav">
          <div className="nav-header">
            <h1 className="nav-title">Leaderboard</h1>
          </div>
        </div>
        
        <div className="leaderboard-content">
          <div className="loading-container">
            <div className="empty-icon">⚠️</div>
            <h2 className="empty-title">Unable to Load</h2>
            <p className="empty-description">Please check your connection and try again.</p>
            <button 
              className="friends-btn"
              onClick={() => fetchLeaderboardData()}
              style={{ marginTop: '20px' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentLeaderboard = activeTab === 'Global' ? globalLeaderboard : friendsLeaderboard;
  const topThree = currentLeaderboard.slice(0, 3);
  const remaining = currentLeaderboard.slice(3);

  return (
    <div className="leaderboard-screen">
      {/* Navigation */}
      <div className="leaderboard-nav">
        <div className="nav-header">
          <h1 className="nav-title">Leaderboard</h1>
          <button className="share-button haptic-feedback" onClick={handleShare}>
            📤
          </button>
        </div>

        {/* Time Period Filter */}
        <div className="period-filter">
          {['Daily', 'Weekly', 'Monthly', 'All Time'].map((period) => (
            <button
              key={period}
              className={`period-button ${timePeriod === period.toLowerCase().replace(' ', '') ? 'active' : ''}`}
              onClick={() => setTimePeriod(period.toLowerCase().replace(' ', ''))}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === 'Global' ? 'active' : ''}`}
            onClick={() => setActiveTab('Global')}
          >
            Global
          </button>
          <button
            className={`tab-button ${activeTab === 'Friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('Friends')}
          >
            Friends ({friendsLeaderboard.length})
          </button>
        </div>
      </div>

      <div className="leaderboard-content">
        {/* Pull to Refresh */}
        <div 
          className={`pull-to-refresh ${refreshing ? 'active' : ''}`}
          onClick={handleRefresh}
        >
          <span className={`refresh-icon ${refreshing ? '' : ''}`}>
            {refreshing ? '🔄' : '⬇️'}
          </span>
          {refreshing ? 'Refreshing...' : 'Pull to refresh'}
        </div>

        {/* Current User Section */}
        {profile && (
          <div className="current-user-section fade-in">
            <div className="current-user-title">Your Position</div>
            <div className="player-item current-user">
              <div className="player-rank">
                #{activeTab === 'Global' ? userRankPosition : 
                  (friendsLeaderboard.findIndex(f => f.id === profile?.id) + 1) || '-'}
              </div>
              <div 
                className="player-avatar"
                style={{ background: `linear-gradient(135deg, ${profile.cham_color || '#667eea'} 0%, ${profile.cham_color || '#764ba2'} 100%)` }}
              >
                {getPlayerAvatar(profile)}
              </div>
              <div className="player-info">
                <div className="player-name">{profile.username}</div>
                <div className="player-score">{profile.total_xp} XP • {profile.current_rank}</div>
              </div>
              <div className="player-actions">
                <div className={`badge ${profile.current_rank.toLowerCase()}`}>
                  {profile.current_rank}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="podium-section slide-up">
            <h2 className="podium-title">🏆 Top Champions</h2>
            <div className="podium-container">
              {[1, 0, 2].map((index) => {
                const player = topThree[index];
                if (!player) return null;
                
                const position = index === 1 ? 'first' : index === 0 ? 'second' : 'third';
                return (
                  <div key={player.id} className={`podium-player ${position}`}>
                    <div 
                      className="podium-avatar"
                      style={{ background: getAvatarColor(player) }}
                    >
                      {getPlayerAvatar(player)}
                      <div className="podium-rank">
                        {getRankEmoji(player.position)}
                      </div>
                    </div>
                    <div className="podium-username">{player.username}</div>
                    <div className="podium-score">{player.total_xp} XP</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="leaderboard-list slide-up">
          <div className="list-header">
            <h3 className="list-title">
              {activeTab === 'Global' ? 'All Players' : 'Your Friends'}
            </h3>
            <button className="friends-btn" onClick={() => setShowFriendModal(true)}>
              👥 Friends
            </button>
          </div>

          {currentLeaderboard.length === 0 ? (
            <div className="loading-container">
              {activeTab === 'Friends' ? (
                <>
                  <div className="empty-icon">👥</div>
                  <h3 className="empty-title">No Friends Yet</h3>
                  <p className="empty-description">Add friends to see how you compare!</p>
                  <button 
                    className="friends-btn"
                    onClick={() => setShowFriendModal(true)}
                    style={{ marginTop: '20px' }}
                  >
                    Add Friends
                  </button>
                </>
              ) : (
                <>
                  <div className="empty-icon">🌍</div>
                  <h3 className="empty-title">No Rankings Yet</h3>
                  <p className="empty-description">Be the first to earn some XP!</p>
                </>
              )}
            </div>
          ) : (
            currentLeaderboard.map((player, index) => {
              const isCurrentUser = player.id === profile?.id;
              
              return (
                <div
                  key={player.id}
                  className={`player-item haptic-feedback ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className={`player-rank ${player.position <= 3 ? 'top-three' : ''}`}>
                    {getRankEmoji(player.position)}
                  </div>
                  
                  <div 
                    className="player-avatar"
                    style={{ background: getAvatarColor(player) }}
                  >
                    {getPlayerAvatar(player)}
                  </div>
                  
                  <div className="player-info">
                    <div className="player-name">
                      {player.username}
                      {isCurrentUser && ' (You)'}
                    </div>
                    <div className="player-score">
                      {player.total_xp} XP • {player.current_rank}
                    </div>
                  </div>
                  
                  <div className="player-actions">
                    <div className={`badge ${player.current_rank.toLowerCase()}`}>
                      {player.current_rank}
                    </div>
                    {!isCurrentUser && (
                      <button 
                        className="challenge-btn haptic-feedback"
                        onClick={() => handleDuelChallenge(player)}
                      >
                        ⚔️
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <FriendRequestModal
        isOpen={showFriendModal}
        onClose={() => setShowFriendModal(false)}
        onFriendAdded={handleFriendAdded}
      />

      {selectedDuelTarget && (
        <DuelChallenge
          targetUser={selectedDuelTarget}
          onClose={() => setSelectedDuelTarget(null)}
          onComplete={handleDuelComplete}
        />
      )}

      {/* Toasts */}
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

export default LeaderboardScreen;