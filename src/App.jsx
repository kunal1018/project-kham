import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import DashboardScreen from './screens/DashboardScreen';
import LessonsScreen from './screens/LessonsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/lessons" element={<LessonsScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
          </Routes>
        </div>
        <Navigation />
      </div>
    </Router>
  );
};

export default App;