import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '📊',
      title: 'ChamCode'
    },
    {
      path: '/lessons',
      label: 'Lessons',
      icon: '🎓',
      title: 'Learn'
    },
    {
      path: '/leaderboard',
      label: 'Leaderboard',
      icon: '🏆',
      title: 'Rankings'
    }
  ];

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;