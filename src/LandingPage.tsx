import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar at the very top */}
      <nav className="landing-navbar">
        <div className="navbar-logo">
          <div className="logo-icon">
            <img className="logo-img" src="/logo.svg" alt="RideAdvisor Logo" />
            <span className="logo-ai">AI</span>
          </div>
          <span className="logo-text">RideAdvisor</span>
        </div>
        <div className="navbar-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <button className="navbar-cta" onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </nav>
      <div className="landing-container">
        <div className="hero">
          <div className="hero-logo">
            <div className="hero-logo-icon">
              <img className="hero-logo-img" src="/logo.svg" alt="RideAdvisor Logo" />
              <span className="hero-logo-ai">AI</span>
            </div>
            <h1 className="title">Welcome to RideAdvisor AI</h1>
          </div>
          <p className="subtitle">Your Intelligent Ride Companion</p>
          <button className="cta-button" onClick={() => navigate('/signup')}>
            Get Started
          </button>
        </div>
        {/* Feature Cards Section */}
        <div className="feature-cards-section" id="features">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Car Recommendations</h3>
            <p>Get personalized car suggestions based on your needs and preferences using advanced AI avatars.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your data is protected with industry-leading security and privacy standards.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Easy Signup</h3>
            <p>Start your journey in seconds with our streamlined registration and onboarding process.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>User & Admin Dashboards</h3>
            <p>Enjoy a modern dashboard experience, whether you're a user or an admin managing the platform.</p>
          </div>
        </div>
        <footer className="landing-footer">
          <div className="footer-content footer-content-vertical footer-content-2row">
            <div className="footer-row">
              <span>© {new Date().getFullYear()} RideAdvisor AI</span>
              <span className="footer-separator">|</span>
              <span>Your Intelligent Ride Companion</span>
            </div>
            <div className="footer-row">
              <a href="mailto:contact@rideadvisor.com" className="footer-link">contact@rideadvisor.com</a>
              <span className="footer-separator">|</span>
              <span className="footer-phone">+1 (555) 123-4567</span>
              <span className="footer-separator">|</span>
              <div className="footer-socials">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-icon" aria-label="LinkedIn">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-icon" aria-label="Twitter">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482c-4.086-.205-7.713-2.164-10.141-5.144a4.822 4.822 0 0 0-.666 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.867 9.867 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636a10.012 10.012 0 0 0 2.457-2.548z"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-icon" aria-label="Facebook">
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.326v-21.349c0-.734-.593-1.326-1.326-1.326z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage; 