import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getPendingFriendRequests, 
  respondToFriendRequest, 
  sendFriendRequest,
  searchUsers 
} from '../lib/supabase';
import './FriendRequestModal.css';

const FriendRequestModal = ({ isOpen, onClose, onFriendAdded }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      fetchPendingRequests();
    }
  }, [isOpen, user]);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await getPendingFriendRequests(user.id);
      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await searchUsers(searchTerm, user.id);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setMessage('Error searching users');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (targetUsername) => {
    setLoading(true);
    try {
      const { data, error } = await sendFriendRequest(user.id, targetUsername);
      if (error) throw error;
      
      if (data.success) {
        setMessage('Friend request sent!');
        setSearchTerm('');
        setSearchResults([]);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      setMessage('Error sending friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (friendshipId, response) => {
    setLoading(true);
    try {
      const { data, error } = await respondToFriendRequest(user.id, friendshipId, response);
      if (error) throw error;
      
      if (data.success) {
        setMessage(`Friend request ${response}!`);
        fetchPendingRequests();
        if (response === 'accepted' && onFriendAdded) {
          onFriendAdded();
        }
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
      setMessage('Error responding to request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="friend-modal-overlay" onClick={onClose}>
      <div className="friend-modal" onClick={(e) => e.stopPropagation()}>
        <div className="friend-modal-header">
          <h2>👥 Friends</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="friend-tabs">
          <button
            className={`friend-tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({pendingRequests.length})
          </button>
          <button
            className={`friend-tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Add Friends
          </button>
        </div>

        <div className="friend-modal-content">
          {message && (
            <div className="friend-message">
              {message}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-section">
              {pendingRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-emoji">📭</div>
                  <p>No pending friend requests</p>
                </div>
              ) : (
                <div className="requests-list">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="request-item">
                      <div className="request-info">
                        <div className="request-username">
                          {request.profiles.username}
                        </div>
                        <div className="request-stats">
                          {request.profiles.total_xp} XP • {request.profiles.current_rank}
                        </div>
                      </div>
                      <div className="request-actions">
                        <button
                          className="accept-btn"
                          onClick={() => handleRespondToRequest(request.id, 'accepted')}
                          disabled={loading}
                        >
                          ✓
                        </button>
                        <button
                          className="decline-btn"
                          onClick={() => handleRespondToRequest(request.id, 'declined')}
                          disabled={loading}
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="search-section">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="search-input"
                />
                <button
                  className="search-btn"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  🔍
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((user) => (
                    <div key={user.id} className="search-result-item">
                      <div className="result-info">
                        <div className="result-username">{user.username}</div>
                        <div className="result-stats">
                          {user.total_xp} XP • {user.current_rank}
                        </div>
                      </div>
                      <button
                        className="add-friend-btn"
                        onClick={() => handleSendRequest(user.username)}
                        disabled={loading}
                      >
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequestModal;