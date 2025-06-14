import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="hero">
        <h1 className="title">Welcome to RideAdvisor AI</h1>
        <p className="subtitle">Your Intelligent Ride Companion</p>
        <button className="cta-button" onClick={() => navigate('/signup')}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage; 