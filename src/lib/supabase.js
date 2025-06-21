// Mock Supabase Functions for UI Showcase
// This file replaces the real Supabase integration with static mock data

console.log('Using mocked Supabase functions for UI showcase');

// Mock data
const mockUsers = [
  { id: "user-1", username: "CodeMaster", total_xp: 2500, current_rank: "Gold", display_tag: "PRO", last_seen: new Date().toISOString(), position: 1 },
  { id: "user-2", username: "PytonNinja", total_xp: 1800, current_rank: "Silver", display_tag: "DEV", last_seen: new Date().toISOString(), position: 2 },
  { id: "user-3", username: "JSWizard", total_xp: 1200, current_rank: "Silver", display_tag: "WIZ", last_seen: new Date().toISOString(), position: 3 },
  { id: "user-4", username: "ReactGuru", total_xp: 950, current_rank: "Bronze", display_tag: "GUI", last_seen: new Date().toISOString(), position: 4 },
  { id: "user-5", username: "DataSci", total_xp: 875, current_rank: "Bronze", display_tag: "SCI", last_seen: new Date().toISOString(), position: 5 },
  { id: "test-user-123", username: "TestUser", total_xp: 650, current_rank: "Bronze", display_tag: "WLU", last_seen: new Date().toISOString(), position: 6 },
  { id: "user-6", username: "WebDev123", total_xp: 580, current_rank: "Bronze", display_tag: "WEB", last_seen: new Date().toISOString(), position: 7 },
  { id: "user-7", username: "AlgoExpert", total_xp: 420, current_rank: "Bronze", display_tag: "ALG", last_seen: new Date().toISOString(), position: 8 },
  { id: "user-8", username: "FullStack", total_xp: 350, current_rank: "Bronze", display_tag: "FS", last_seen: new Date().toISOString(), position: 9 },
  { id: "user-9", username: "CSSNinja", total_xp: 320, current_rank: "Bronze", display_tag: "CSS", last_seen: new Date().toISOString(), position: 10 },
];

const mockLessons = [
  { id: "lesson-1", title: "Variables & Data Types", description: "Understand strings, integers, and booleans.", type: "Multiple Choice", difficulty: "Beginner", xp_reward: 25, icon: "💾", color: "#34D399", order_index: 1, is_active: true },
  { id: "lesson-2", title: "Loops", description: "Practice for, while, and range loops.", type: "Fill in the Blank", difficulty: "Medium", xp_reward: 35, icon: "🔄", color: "#60A5FA", order_index: 2, is_active: true },
  { id: "lesson-3", title: "Functions", description: "Learn how to define and call functions.", type: "Syntax Practice", difficulty: "Hard", xp_reward: 45, icon: "⚙️", color: "#FF7F6B", order_index: 3, is_active: true },
  { id: "lesson-4", title: "Lists & Dictionaries", description: "Use collections to store and retrieve data.", type: "Multiple Choice", difficulty: "Beginner", xp_reward: 30, icon: "📚", color: "#A78BFA", order_index: 4, is_active: true },
  { id: "lesson-5", title: "Object-Oriented Programming", description: "Master classes and objects in Python.", type: "Fill in the Blank", difficulty: "Medium", xp_reward: 40, icon: "🏗️", color: "#60A5FA", order_index: 5, is_active: true },
  { id: "lesson-6", title: "Error Handling", description: "Learn try-catch and debugging techniques.", type: "Syntax Practice", difficulty: "Hard", xp_reward: 50, icon: "🛠️", color: "#FF7F6B", order_index: 6, is_active: true },
];

const mockUserLessons = [
  { id: "ul-1", user_id: "test-user-123", lesson_id: "lesson-1", completed_at: new Date().toISOString(), score: 100, attempts: 1, lessons: mockLessons[0] },
  { id: "ul-2", user_id: "test-user-123", lesson_id: "lesson-2", completed_at: new Date().toISOString(), score: 85, attempts: 2, lessons: mockLessons[1] },
];

const mockFriends = [
  { id: "user-1", username: "CodeMaster", total_xp: 2500, current_rank: "Gold", display_tag: "PRO", last_seen: new Date().toISOString(), position: 1 },
  { id: "user-2", username: "PytonNinja", total_xp: 1800, current_rank: "Silver", display_tag: "DEV", last_seen: new Date().toISOString(), position: 2 },
  { id: "user-3", username: "JSWizard", total_xp: 1200, current_rank: "Silver", display_tag: "WIZ", last_seen: new Date().toISOString(), position: 3 },
  { id: "user-4", username: "ReactGuru", total_xp: 950, current_rank: "Bronze", display_tag: "GUI", last_seen: new Date().toISOString(), position: 4 },
  { id: "test-user-123", username: "TestUser", total_xp: 650, current_rank: "Bronze", display_tag: "WLU", last_seen: new Date().toISOString(), position: 5 },
];

const mockFriendRequests = [
  { id: "req-1", requester_id: "user-4", created_at: new Date().toISOString(), requester: { username: "ReactGuru", total_xp: 950, current_rank: "Bronze", display_tag: "GUI" } },
  { id: "req-2", requester_id: "user-5", created_at: new Date().toISOString(), requester: { username: "DataSci", total_xp: 875, current_rank: "Bronze", display_tag: "SCI" } },
];

const mockDuels = [
  { id: "duel-1", challenger_id: "test-user-123", opponent_id: "user-1", status: "completed", winner_id: "test-user-123", xp_reward: 20, created_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 86400000).toISOString(), challenger: { username: "TestUser" }, opponent: { username: "CodeMaster" }, winner: { username: "TestUser" } },
  { id: "duel-2", challenger_id: "user-2", opponent_id: "test-user-123", status: "completed", winner_id: "user-2", xp_reward: 15, created_at: new Date(Date.now() - 172800000).toISOString(), completed_at: new Date(Date.now() - 172800000).toISOString(), challenger: { username: "PytonNinja" }, opponent: { username: "TestUser" }, winner: { username: "PytonNinja" } },
];

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Auth functions
export const signUp = async (email, password, username) => {
  await delay();
  return { data: { user: { id: "new-user", email } }, error: null };
};

export const signIn = async (email, password) => {
  await delay();
  return { data: { user: { id: "test-user-123", email } }, error: null };
};

export const signOut = async () => {
  await delay();
  return { error: null };
};

export const getCurrentUser = async () => {
  await delay();
  return { user: { id: "test-user-123", email: "test@example.com" }, error: null };
};

// Mock Profile functions
export const getUserProfile = async (userId) => {
  await delay();
  const profile = {
    id: userId,
    username: "TestUser",
    total_xp: 350,
    current_rank: "Silver",
    daily_streak: 5,
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    display_tag: "WLU",
    last_seen: new Date().toISOString()
  };
  return { data: profile, error: null };
};

export const updateUserProfile = async (userId, updates) => {
  await delay();
  const updatedProfile = { id: userId, ...updates, updated_at: new Date().toISOString() };
  return { data: updatedProfile, error: null };
};

export const addUserXP = async (userId, xpAmount) => {
  await delay();
  console.log(`Mock: Adding ${xpAmount} XP to user ${userId}`);
  return { data: { total_xp: 350 + xpAmount }, error: null };
};

// Mock Lessons functions
export const getLessons = async () => {
  await delay();
  return { data: mockLessons, error: null };
};

export const getUserLessons = async (userId) => {
  await delay();
  if (!userId) {
    return { data: [], error: new Error('User ID is required') };
  }
  return { data: mockUserLessons, error: null };
};

export const completeLesson = async (userId, lessonId, score = 100) => {
  await delay();
  const lesson = mockLessons.find(l => l.id === lessonId);
  const completedLesson = {
    id: `ul-${Date.now()}`,
    user_id: userId,
    lesson_id: lessonId,
    score,
    completed_at: new Date().toISOString()
  };
  return { 
    data: { 
      lesson: completedLesson, 
      profile: { total_xp: 350 + (lesson?.xp_reward || 25) } 
    }, 
    error: null 
  };
};

// Mock Leaderboard functions
export const getGlobalLeaderboard = async (limit = 50) => {
  await delay();
  const sortedUsers = [...mockUsers]
    .sort((a, b) => b.total_xp - a.total_xp)
    .slice(0, limit)
    .map((user, index) => ({ ...user, position: index + 1 }));
  return { data: sortedUsers, error: null };
};

export const getUserRankPosition = async (userId) => {
  await delay();
  const user = mockUsers.find(u => u.id === userId);
  return { data: user ? user.position : mockUsers.length + 1, error: null };
};

// Mock Friends functions
export const getFriendsList = async (userId) => {
  await delay();
  return { data: mockFriends, error: null };
};

export const getPendingFriendRequests = async (userId) => {
  await delay();
  return { data: mockFriendRequests, error: null };
};

export const sendFriendRequest = async (userId, targetUsername) => {
  await delay();
  const targetUser = mockUsers.find(u => u.username === targetUsername);
  if (!targetUser) {
    return { data: { success: false, message: 'User not found' }, error: null };
  }
  if (targetUser.id === userId) {
    return { data: { success: false, message: 'Cannot send friend request to yourself' }, error: null };
  }
  return { data: { success: true, message: 'Friend request sent!' }, error: null };
};

export const respondToFriendRequest = async (userId, friendshipId, response) => {
  await delay();
  return { data: { success: true, message: `Friend request ${response}!` }, error: null };
};

export const searchUsers = async (searchTerm, currentUserId, limit = 10) => {
  await delay();
  const results = mockUsers
    .filter(user => 
      user.id !== currentUserId && 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, limit);
  return { data: results, error: null };
};

// Mock Duel functions
export const createDuel = async (challengerId, opponentId) => {
  await delay();
  const newDuel = {
    id: `duel-${Date.now()}`,
    challenger_id: challengerId,
    opponent_id: opponentId,
    status: 'active',
    created_at: new Date().toISOString()
  };
  return { data: newDuel, error: null };
};

export const acceptDuel = async (duelId) => {
  await delay();
  return { data: { id: duelId, status: 'active' }, error: null };
};

export const completeDuel = async (duelId, winnerId, xpReward) => {
  await delay();
  const duel = {
    id: duelId,
    winner_id: winnerId,
    xp_reward: xpReward,
    status: 'completed',
    completed_at: new Date().toISOString(),
    winner_xp: xpReward,
    loser_xp: Math.max(Math.floor(xpReward / 3), 3)
  };
  return { data: duel, error: null };
};

export const getUserDuels = async (userId) => {
  await delay();
  return { data: mockDuels, error: null };
};

// Mock Real-time subscriptions
export const subscribeToLeaderboardChanges = (callback) => {
  console.log('Mock: Subscribed to leaderboard changes');
  return { unsubscribe: () => console.log('Mock: Unsubscribed from leaderboard changes') };
};

export const subscribeToFriendRequests = (userId, callback) => {
  console.log(`Mock: Subscribed to friend requests for user ${userId}`);
  return { unsubscribe: () => console.log(`Mock: Unsubscribed from friend requests for user ${userId}`) };
};

export const unsubscribeFromFriendRequests = (userId) => {
  console.log(`Mock: Unsubscribed from friend requests for user ${userId}`);
};

export const subscribeToUserProfile = (userId, callback) => {
  console.log(`Mock: Subscribed to user profile changes for user ${userId}`);
  return { unsubscribe: () => console.log(`Mock: Unsubscribed from user profile changes for user ${userId}`) };
};

// Mock client (not used but exported for compatibility)
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};