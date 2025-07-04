import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import SignupPage from './SignupPage';
import LoginPage from './LoginPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import AvatarSelectionPage from './AvatarSelectionPage';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import WatchlistPage from './WatchlistPage';
import DreamFundDashboard from './components/DreamFundDashboard';
import DealAlertsPage from './DealAlertsPage';
import AccountSettingsPage from './AccountSettingsPage';
import './App.css';
import { getAuth } from 'firebase/auth';
import { useAuthUser } from './useAuthUser';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

function App() {
  const user = useAuthUser();
  const ADMIN_EMAIL = 'admin@rideadvisor.com';

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/choose-avatar" element={<AvatarSelectionPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/admin" element={user && user.email === ADMIN_EMAIL ? <AdminDashboard /> : <AdminLogin />} />
        <Route path="/dreamfund" element={<DreamFundDashboard />} />
        <Route path="/deals" element={<DealAlertsPage />} />
        <Route path="/settings" element={<AccountSettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
