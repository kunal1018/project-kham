import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  // Mock user data - hardcoded for UI showcase
  const [user] = useState({
    id: 'test-user-123',
    email: 'testuser@chamcode.com'
  })

  const [profile] = useState({
    id: 'test-user-123',
    username: 'TestUser',
    total_xp: 350,
    current_rank: 'Silver',
    daily_streak: 5,
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    display_tag: 'WLU',
    last_seen: new Date().toISOString(),
    earned_badges: ['100_xp_club', 'first_lesson', 'streak_master', 'bronze_rank'],
    cham_color: '#C0C0C0',
    customization: {
      cham_color: '#C0C0C0',
      display_tag: 'WLU'
    }
  })

  const [loading] = useState(false)
  const [authError] = useState(null)

  const refreshProfile = async () => {
    // Mock function - does nothing in showcase mode
    console.log('Mock: refreshProfile called')
  }

  const updateProfileCustomization = (updates) => {
    // Mock function - does nothing in showcase mode
    console.log('Mock: updateProfileCustomization called with:', updates)
  }

  const addXP = (amount) => {
    // Mock function - does nothing in showcase mode
    console.log('Mock: addXP called with amount:', amount)
  }

  const clearAuthError = () => {
    // Mock function - does nothing in showcase mode
    console.log('Mock: clearAuthError called')
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