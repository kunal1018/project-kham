import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getUserProfile } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...')
        
        // First get the session instead of calling getCurrentUser directly
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error getting session:', sessionError)
          throw new Error(`Session error: ${sessionError.message}`)
        }

        if (!mounted) return

        console.log('Session data:', session)
        
        // Use session.user if available, otherwise user is null
        const currentUser = session?.user || null
        setUser(currentUser)
        
        if (currentUser) {
          console.log('Fetching user profile for:', currentUser.id)
          const { data: userProfile, error: profileError } = await getUserProfile(currentUser.id)
          
          if (profileError) {
            console.error('Error getting user profile:', profileError)
            // Don't throw here, profile might not exist yet
            setProfile(null)
          } else {
            console.log('User profile:', userProfile)
            setProfile(enhanceProfileWithGameData(userProfile))
          }
        } else {
          setProfile(null)
        }

        // Listen for auth changes
        console.log('Setting up auth state listener...')
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            try {
              console.log('Auth state changed:', event, session?.user?.id)
              
              if (!mounted) return

              const sessionUser = session?.user || null
              setUser(sessionUser)
              
              if (sessionUser) {
                const { data: userProfile, error: profileError } = await getUserProfile(sessionUser.id)
                if (profileError) {
                  console.error('Error getting profile on auth change:', profileError)
                  setProfile(null)
                } else {
                  setProfile(enhanceProfileWithGameData(userProfile))
                }
              } else {
                setProfile(null)
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error)
              setAuthError(`Auth state change error: ${error.message}`)
            }
          }
        )

        // Cleanup function
        return () => {
          console.log('Cleaning up auth subscription...')
          subscription.unsubscribe()
        }

      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setAuthError(error.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Enhance profile with gamification data
  const enhanceProfileWithGameData = (baseProfile) => {
    if (!baseProfile) return null;

    try {
      const now = new Date();
      
      // Validate and handle lastActivity date
      let lastActivity
      try {
        lastActivity = new Date(baseProfile.last_activity)
        // Check if date is valid
        if (isNaN(lastActivity.getTime())) {
          console.warn('Invalid last_activity date, using current time')
          lastActivity = new Date()
        }
      } catch (dateError) {
        console.warn('Error parsing last_activity date, using current time:', dateError)
        lastActivity = new Date()
      }

      const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

      // Calculate streak
      let actualStreak = baseProfile.daily_streak || 0;
      if (daysSinceActivity === 0) {
        // Same day, keep current streak
      } else if (daysSinceActivity === 1) {
        // Yesterday, increment streak (simulated)
        actualStreak = Math.min(actualStreak + 1, 15);
      } else if (daysSinceActivity > 1) {
        // More than a day, reset streak
        actualStreak = 0;
      }

      // Calculate earned badges
      const earnedBadges = [];
      if (baseProfile.total_xp >= 100) earnedBadges.push('100_xp_club');
      if (baseProfile.total_xp >= 25) earnedBadges.push('first_lesson');
      if (actualStreak >= 7) earnedBadges.push('streak_master');
      if (baseProfile.current_rank === 'Bronze') earnedBadges.push('bronze_rank');
      if (baseProfile.current_rank === 'Silver') earnedBadges.push('silver_rank');
      if (baseProfile.current_rank === 'Gold') earnedBadges.push('gold_rank');
      
      // Add random badges for demo
      if (baseProfile.total_xp >= 200) earnedBadges.push('speed_demon');
      if (baseProfile.total_xp >= 500) earnedBadges.push('perfectionist');

      return {
        ...baseProfile,
        daily_streak: actualStreak,
        earned_badges: earnedBadges,
        cham_color: getChamColorByXP(baseProfile.total_xp),
        display_tag: baseProfile.display_tag || 'WLU',
        customization: {
          cham_color: getChamColorByXP(baseProfile.total_xp),
          display_tag: baseProfile.display_tag || 'WLU'
        }
      };
    } catch (error) {
      console.error('Error enhancing profile:', error)
      setAuthError(`Profile enhancement error: ${error.message}`)
      return baseProfile
    }
  };

  const getChamColorByXP = (xp) => {
    if (xp >= 2500) return '#FFD700'; // Gold
    if (xp >= 1000) return '#C0C0C0'; // Silver
    return '#CD7F32'; // Bronze
  };

  const refreshProfile = async () => {
    if (!user) return

    try {
      console.log('Refreshing profile for user:', user.id)
      const { data: userProfile, error } = await getUserProfile(user.id)
      if (error) {
        console.error('Error refreshing profile:', error)
        throw error
      }
      setProfile(enhanceProfileWithGameData(userProfile))
    } catch (error) {
      console.error('Error in refreshProfile:', error)
      setAuthError(`Profile refresh error: ${error.message}`)
    }
  }

  const updateProfileCustomization = (updates) => {
    if (profile) {
      setProfile({
        ...profile,
        ...updates,
        customization: {
          ...profile.customization,
          ...updates
        }
      });
    }
  };

  const addXP = (amount) => {
    if (profile) {
      const newXP = profile.total_xp + amount;
      setProfile({
        ...profile,
        total_xp: newXP,
        cham_color: getChamColorByXP(newXP)
      });
    }
  };

  const clearAuthError = () => {
    setAuthError(null)
  }

  const value = {
    user,
    profile,
    loading,
    authError,
    refreshProfile,
    updateProfileCustomization,
    addXP,
    clearAuthError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}