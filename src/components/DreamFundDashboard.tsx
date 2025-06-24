import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '../useAuthUser';

interface DreamFundData {
  currentPoints: number;
  totalPointsEarned: number;
  nextRewardPoints: number;
  currentTier: string;
  rewardsEarned: Reward[];
  recentTransactions: Transaction[];
}

interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
  earnedDate?: string;
  isAvailable: boolean;
}

interface Transaction {
  id: string;
  type: 'earned' | 'spent';
  points: number;
  description: string;
  date: string;
}

const DreamFundDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthUser();
  const [dreamFundData, setDreamFundData] = useState<DreamFundData>({
    currentPoints: 0,
    totalPointsEarned: 0,
    nextRewardPoints: 1000,
    currentTier: 'Bronze',
    rewardsEarned: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Fetch DreamFund data from backend
  useEffect(() => {
    if (user) {
      fetchDreamFundData();
    }
  }, [user]);

  const fetchDreamFundData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8001/dreamfund/${user.uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setDreamFundData(data.dreamFundData);
      } else {
        setError(data.error || 'Failed to load DreamFund data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching DreamFund data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((dreamFundData.currentPoints / dreamFundData.nextRewardPoints) * 100, 100);

  // Get tier benefits
  const getTierBenefits = (tier: string) => {
    const benefits = {
      Bronze: ['Earn 1 point per $1 spent', 'Basic rewards available'],
      Silver: ['Earn 1.5 points per $1 spent', 'Premium rewards available', 'Priority customer support'],
      Gold: ['Earn 2 points per $1 spent', 'Exclusive rewards available', 'VIP customer support', 'Free annual maintenance']
    };
    return benefits[tier as keyof typeof benefits] || benefits.Bronze;
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!user || dreamFundData.currentPoints < reward.pointsCost) {
      setNotification({ type: 'error', message: 'Insufficient points to redeem this reward' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setRedeemingRewardId(reward.id);
    try {
      const response = await fetch(`http://localhost:8001/dreamfund/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          rewardId: reward.id,
          pointsCost: reward.pointsCost
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state instead of reloading
        const updatedRewards = dreamFundData.rewardsEarned.map(r => 
          r.id === reward.id 
            ? { ...r, isAvailable: false, earnedDate: new Date().toISOString().split('T')[0] }
            : r
        );
        
        const newCurrentPoints = dreamFundData.currentPoints - reward.pointsCost;
        
        // Add transaction record
        const transactionRecord = {
          id: Date.now().toString(),
          type: 'spent' as const,
          points: -reward.pointsCost,
          description: `Redeemed: ${reward.name}`,
          date: new Date().toISOString().split('T')[0]
        };
        
        setDreamFundData(prev => ({
          ...prev,
          currentPoints: newCurrentPoints,
          rewardsEarned: updatedRewards,
          recentTransactions: [transactionRecord, ...prev.recentTransactions]
        }));
        
        setNotification({ type: 'success', message: `Successfully redeemed ${reward.name}!` });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to redeem reward' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
      console.error('Error redeeming reward:', err);
    } finally {
      setRedeemingRewardId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
        color: '#1e293b', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 16 }}>⏳</div>
          <p style={{ fontSize: '1.2rem' }}>Loading DreamFund data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
        color: '#1e293b', 
        padding: '40px 20px' 
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>⚠️ Error</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>{error}</p>
          <button 
            onClick={fetchDreamFundData}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      color: '#1e293b', 
      padding: '40px 20px' 
    }}>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Notification */}
        {notification && (
          <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
            padding: '16px 24px',
            borderRadius: 12,
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            background: notification.type === 'success' 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: 400
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.2rem' }}>
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 40 
        }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8, color: '#1e293b' }}>
              DreamFund Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              Your loyalty points and rewards center
            </p>
          </div>
        </div>

        {/* Points Overview */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          marginBottom: 32,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 8, color: '#2563eb' }}>
                {dreamFundData.currentPoints}
              </h3>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Current Points</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8, color: '#2563eb' }}>
                {dreamFundData.currentTier}
              </h3>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Current Tier</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8, color: '#2563eb' }}>
                {dreamFundData.totalPointsEarned}
              </h3>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Total Points Earned</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Reward */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          marginBottom: 32,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>
            Progress to Next Reward
          </h2>
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: 8 
            }}>
              <span style={{ color: '#64748b' }}>Current: {dreamFundData.currentPoints} points</span>
              <span style={{ color: '#64748b' }}>Next Reward: {dreamFundData.nextRewardPoints} points</span>
            </div>
            <div style={{ 
              background: '#e2e8f0', 
              borderRadius: 12, 
              height: 20, 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                height: '100%',
                width: `${progressPercentage}%`,
                borderRadius: 12,
                transition: 'width 0.5s ease'
              }} />
            </div>
            <p style={{ 
              textAlign: 'center', 
              marginTop: 8, 
              color: '#475569',
              fontSize: '1.1rem'
            }}>
              {Math.round(progressPercentage)}% Complete
            </p>
          </div>
        </div>

        {/* Tier Benefits */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          marginBottom: 32,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>
            {dreamFundData.currentTier} Tier Benefits
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {getTierBenefits(dreamFundData.currentTier).map((benefit, index) => (
              <div key={index} style={{ 
                background: '#f8fafc', 
                padding: 16, 
                borderRadius: 8,
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ color: '#3b82f6', fontWeight: 600 }}>✓ {benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Available Rewards */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          marginBottom: 32,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24, color: '#1e293b' }}>
            Available Rewards
          </h2>
          {dreamFundData.rewardsEarned.filter(reward => reward.isAvailable !== false).length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', fontSize: '1.1rem' }}>
              No rewards available yet. Keep earning points to unlock rewards!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {dreamFundData.rewardsEarned
                .filter(reward => reward.isAvailable !== false) // Only show available rewards
                .map(reward => (
                <div key={reward.id} style={{ 
                  background: '#f8fafc', 
                  borderRadius: 12, 
                  padding: 24,
                  border: '1px solid #e2e8f0',
                  position: 'relative'
                }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>
                    {reward.name}
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: 16 }}>
                    {reward.description}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <span style={{ 
                      background: '#dbeafe', 
                      color: '#2563eb', 
                      padding: '6px 12px', 
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      {reward.pointsCost} points
                    </span>
                    <button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={redeemingRewardId === reward.id || dreamFundData.currentPoints < reward.pointsCost || reward.isAvailable === false}
                      style={{
                        background: (dreamFundData.currentPoints >= reward.pointsCost && reward.isAvailable !== false && redeemingRewardId !== reward.id) ? '#2563eb' : '#9ca3af',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 20px',
                        fontWeight: 600,
                        cursor: (dreamFundData.currentPoints >= reward.pointsCost && reward.isAvailable !== false && redeemingRewardId !== reward.id) ? 'pointer' : 'not-allowed',
                        opacity: redeemingRewardId === reward.id ? 0.7 : 1
                      }}
                    >
                      {redeemingRewardId === reward.id ? 'Redeeming...' : (reward.isAvailable === false ? 'Redeemed' : 'Redeem')}
                    </button>
                  </div>
                  {reward.earnedDate && (
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#64748b', 
                      marginTop: 12,
                      fontStyle: 'italic'
                    }}>
                      Earned: {new Date(reward.earnedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Redeemed Rewards */}
        {dreamFundData.rewardsEarned.filter(reward => reward.isAvailable === false).length > 0 && (
          <div style={{ 
            background: '#fff', 
            borderRadius: 16, 
            padding: 32, 
            marginBottom: 32,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24, color: '#1e293b' }}>
              Redeemed Rewards
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {dreamFundData.rewardsEarned
                .filter(reward => reward.isAvailable === false) // Only show redeemed rewards
                .map(reward => (
                <div key={reward.id} style={{ 
                  background: '#f1f5f9', 
                  borderRadius: 12, 
                  padding: 24,
                  border: '1px solid #cbd5e1',
                  position: 'relative',
                  opacity: 0.8
                }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8, color: '#475569' }}>
                    {reward.name}
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: 16 }}>
                    {reward.description}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <span style={{ 
                      background: '#e2e8f0', 
                      color: '#64748b', 
                      padding: '6px 12px', 
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      {reward.pointsCost} points
                    </span>
                    <span style={{ 
                      background: '#10b981', 
                      color: '#fff', 
                      padding: '6px 12px', 
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      Redeemed
                    </span>
                  </div>
                  {reward.earnedDate && (
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#64748b', 
                      marginTop: 12,
                      fontStyle: 'italic'
                    }}>
                      Redeemed: {new Date(reward.earnedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          padding: 32,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24, color: '#1e293b' }}>
            Recent Transactions
          </h2>
          {dreamFundData.recentTransactions.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', fontSize: '1.1rem' }}>
              No transactions yet. Start earning points by using our services!
            </p>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {dreamFundData.recentTransactions.map(transaction => (
                <div key={transaction.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 4, color: '#1e293b' }}>
                      {transaction.description}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{ 
                    color: transaction.type === 'earned' ? '#10b981' : '#ef4444',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    {transaction.type === 'earned' ? '+' : ''}{transaction.points} points
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamFundDashboard; 