import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging for environment variables
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test the connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('Supabase connection test failed:', error)
    } else {
      console.log('Supabase connection test successful')
    }
  } catch (error) {
    console.error('Supabase connection test error:', error)
  }
}

// Test connection on module load
testConnection()

// Auth helpers
export const signUp = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username
      }
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Profile helpers
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      last_activity: new Date().toISOString(),
      last_seen: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export const addUserXP = async (userId, xpAmount) => {
  const { data: profile, error: getError } = await getUserProfile(userId)
  if (getError) return { data: null, error: getError }

  const { data, error } = await updateUserProfile(userId, {
    total_xp: profile.total_xp + xpAmount
  })
  return { data, error }
}

// Lessons helpers
export const getLessons = async () => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_active', true)
    .order('order_index')
  return { data, error }
}

export const getUserLessons = async (userId) => {
  if (!userId) {
    console.error('getUserLessons called without userId')
    return { data: [], error: new Error('User ID is required') }
  }

  console.log('Fetching lessons for user:', userId)
  
  try {
  const { data, error } = await supabase
    .from('user_lessons')
    .select(`
      *,
      lessons (*)
    `)
    .eq('user_id', userId)
    
    if (error) {
      console.error('Supabase query error:', error)
    } else {
      console.log('Successfully fetched user lessons:', data?.length || 0, 'records')
    }
    
  return { data, error }
  } catch (networkError) {
    console.error('Network error in getUserLessons:', networkError)
    return { data: [], error: networkError }
  }
}

export const completeLesson = async (userId, lessonId, score = 100) => {
  // First, insert the lesson completion
  const { data: lessonData, error: lessonError } = await supabase
    .from('user_lessons')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      score: score,
      completed_at: new Date().toISOString()
    })
    .select()

  if (lessonError) return { data: null, error: lessonError }

  // Get the lesson XP reward
  const { data: lesson, error: getLessonError } = await supabase
    .from('lessons')
    .select('xp_reward')
    .eq('id', lessonId)
    .single()

  if (getLessonError) return { data: lessonData, error: getLessonError }

  // Update user's total XP using the new helper
  const { data: updatedProfile, error: updateError } = await addUserXP(userId, lesson.xp_reward)

  return { data: { lesson: lessonData, profile: updatedProfile }, error: updateError }
}

// Leaderboard helpers - with fallback for missing functions
export const getGlobalLeaderboard = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, total_xp, current_rank, display_tag, last_seen')
      .order('total_xp', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Leaderboard query error:', error)
      return { data: null, error }
    }
    
    // Add position to each user
    const dataWithPosition = (data || []).map((user, index) => ({
      ...user,
      position: index + 1
    }))
    
    return { data: dataWithPosition, error: null }
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return { data: [], error }
  }
}

export const getUserRankPosition = async (userId) => {
  try {
    // Fallback implementation if RPC function doesn't exist
    const { data: allUsers, error } = await supabase
      .from('profiles')
      .select('id, total_xp')
      .order('total_xp', { ascending: false })
    
    if (error) return { data: 0, error }
    
    const position = allUsers.findIndex(user => user.id === userId) + 1
    return { data: position, error: null }
  } catch (error) {
    console.error('User rank error:', error)
    return { data: 0, error }
  }
}

// Friends system helpers - with explicit aliases to fix table name conflicts
export const getFriendsList = async (userId) => {
  try {
    // Use explicit aliases for the joined profiles tables
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        requester_id,
        addressee_id,
        status,
        requester:profiles!friendships_requester_id_fkey (
          id, username, total_xp, current_rank, display_tag, last_seen
        ),
        addressee:profiles!friendships_addressee_id_fkey (
          id, username, total_xp, current_rank, display_tag, last_seen
        )
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted')
    
    if (error) {
      console.error('Friends list error:', error)
      return { data: [], error: null } // Return empty array instead of error
    }
    
    // Process the data to get friend profiles
    const friends = (data || []).map((friendship, index) => {
      // Get the friend's profile (not the current user's)
      const friend = friendship.requester_id === userId ? 
        friendship.addressee : friendship.requester
      
      if (!friend || friend.id === userId) return null
      
      return {
        ...friend,
        position: index + 1
      }
    }).filter(friend => friend !== null)
    
    return { data: friends, error: null }
  } catch (error) {
    console.error('Friends fetch error:', error)
    return { data: [], error: null }
  }
}

export const getPendingFriendRequests = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        requester_id,
        created_at,
        requester:profiles!friendships_requester_id_fkey (
          username,
          total_xp,
          current_rank,
          display_tag
        )
      `)
      .eq('addressee_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    return { data: data || [], error }
  } catch (error) {
    console.error('Friend requests error:', error)
    return { data: [], error }
  }
}

export const sendFriendRequest = async (userId, targetUsername) => {
  try {
    // First find the target user
    const { data: targetUser, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', targetUsername)
      .single()
    
    if (findError || !targetUser) {
      return { data: { success: false, message: 'User not found' }, error: null }
    }
    
    if (targetUser.id === userId) {
      return { data: { success: false, message: 'Cannot send friend request to yourself' }, error: null }
    }
    
    // Check if friendship already exists
    const { data: existing, error: checkError } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(requester_id.eq.${userId},addressee_id.eq.${targetUser.id}),and(requester_id.eq.${targetUser.id},addressee_id.eq.${userId})`)
    
    if (existing && existing.length > 0) {
      return { data: { success: false, message: 'Friend request already exists' }, error: null }
    }
    
    // Create friend request
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        requester_id: userId,
        addressee_id: targetUser.id,
        status: 'pending'
      })
    
    if (error) {
      return { data: { success: false, message: 'Error sending friend request' }, error }
    }
    
    return { data: { success: true, message: 'Friend request sent!' }, error: null }
  } catch (error) {
    console.error('Send friend request error:', error)
    return { data: { success: false, message: 'Error sending friend request' }, error }
  }
}

export const respondToFriendRequest = async (userId, friendshipId, response) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: response, updated_at: new Date().toISOString() })
      .eq('id', friendshipId)
      .eq('addressee_id', userId)
      .eq('status', 'pending')
    
    if (error) {
      return { data: { success: false, message: 'Error responding to friend request' }, error }
    }
    
    return { data: { success: true, message: `Friend request ${response}!` }, error: null }
  } catch (error) {
    console.error('Respond to friend request error:', error)
    return { data: { success: false, message: 'Error responding to friend request' }, error }
  }
}

export const searchUsers = async (searchTerm, currentUserId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, total_xp, current_rank, display_tag')
      .ilike('username', `%${searchTerm}%`)
      .neq('id', currentUserId)
      .limit(limit)
    
    return { data: data || [], error }
  } catch (error) {
    console.error('Search users error:', error)
    return { data: [], error }
  }
}

// Duel system helpers - with fallbacks
export const createDuel = async (challengerId, opponentId) => {
  try {
    const { data, error } = await supabase
      .from('duels')
      .insert({
        challenger_id: challengerId,
        opponent_id: opponentId,
        status: 'pending'
      })
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Create duel error:', error)
    return { data: null, error }
  }
}

export const acceptDuel = async (duelId) => {
  try {
    const { data, error } = await supabase
      .from('duels')
      .update({ status: 'active' })
      .eq('id', duelId)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Accept duel error:', error)
    return { data: null, error }
  }
}

export const completeDuel = async (duelId, winnerId, xpReward) => {
  try {
    // Simple implementation without RPC function
    const loserXP = Math.max(Math.floor(xpReward / 3), 3)
    
    // Update duel status
    const { data: duelData, error: duelError } = await supabase
      .from('duels')
      .update({
        status: 'completed',
        winner_id: winnerId,
        xp_reward: xpReward,
        completed_at: new Date().toISOString()
      })
      .eq('id', duelId)
      .select()
      .single()
    
    if (duelError) return { data: null, error: duelError }
    
    // Update winner's XP
    await addUserXP(winnerId, xpReward)
    
    // Update loser's XP
    const loserId = duelData.challenger_id === winnerId ? duelData.opponent_id : duelData.challenger_id
    await addUserXP(loserId, loserXP)
    
    return { 
      data: { 
        ...duelData, 
        winner_xp: xpReward, 
        loser_xp: loserXP 
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Complete duel error:', error)
    return { data: null, error }
  }
}

export const getUserDuels = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('duels')
      .select(`
        *,
        challenger:profiles!duels_challenger_id_fkey (username, total_xp, current_rank),
        opponent:profiles!duels_opponent_id_fkey (username, total_xp, current_rank),
        winner:profiles!duels_winner_id_fkey (username)
      `)
      .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    return { data: data || [], error }
  } catch (error) {
    console.error('Get user duels error:', error)
    return { data: [], error }
  }
}

// Real-time subscriptions with proper channel management
let leaderboardChannel = null
let friendRequestsChannels = new Map()
let userProfileChannels = new Map()

export const subscribeToLeaderboardChanges = (callback) => {
  try {
    // Unsubscribe from existing channel if it exists
    if (leaderboardChannel) {
      leaderboardChannel.unsubscribe()
    }
    
    leaderboardChannel = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: 'total_xp=neq.null'
      }, callback)
      .subscribe()
    
    return leaderboardChannel
  } catch (error) {
    console.error('Leaderboard subscription error:', error)
    return { unsubscribe: () => {} }
  }
}

export const subscribeToFriendRequests = (userId, callback) => {
  try {
    // Check if we already have a channel for this user
    if (friendRequestsChannels.has(userId)) {
      const existingChannel = friendRequestsChannels.get(userId)
      existingChannel.unsubscribe()
    }
    
    const channel = supabase
      .channel(`friend-requests-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `addressee_id=eq.${userId}`
      }, callback)
      .subscribe()
    
    friendRequestsChannels.set(userId, channel)
    return channel
  } catch (error) {
    console.error('Friend requests subscription error:', error)
    return { unsubscribe: () => {} }
  }
}

export const unsubscribeFromFriendRequests = (userId) => {
  if (friendRequestsChannels.has(userId)) {
    const channel = friendRequestsChannels.get(userId)
    channel.unsubscribe()
    friendRequestsChannels.delete(userId)
  }
}

export const subscribeToUserProfile = (userId, callback) => {
  try {
    // Check if we already have a channel for this user
    if (userProfileChannels.has(userId)) {
      const existingChannel = userProfileChannels.get(userId)
      existingChannel.unsubscribe()
    }
    
    const channel = supabase
      .channel(`user-profile-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, callback)
      .subscribe()
    
    userProfileChannels.set(userId, channel)
    return channel
  } catch (error) {
    console.error('User profile subscription error:', error)
    return { unsubscribe: () => {} }
  }
}