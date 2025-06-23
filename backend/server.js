const express = require('express');
const cors = require('cors');
const admin = require('./firebase_config');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    console.log('Attempting to create user with email:', email);

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: false
    });

    console.log('User created successfully:', userRecord.uid);

    // Store additional user data in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      phoneNumber: phoneNumber || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'user',
      isVerified: false
    });

    console.log('User data stored in Firestore');

    // Send email verification
    const verificationLink = await admin.auth().generateEmailVerificationLink(email);
    console.log('Verification link generated');

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Detailed error registering user:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        error: 'Password should be at least 6 characters'
      });
    }

    if (error.code === 'auth/configuration-not-found') {
      return res.status(500).json({
        success: false,
        error: 'Firebase configuration error. Please check server logs.'
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || 'An error occurred during registration'
    });
  }
});

// Login endpoint (only allow email-verified users)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    // Firebase Admin SDK does not support password verification directly.
    // You should use Firebase Client SDK on the frontend for sign-in and token verification.
    // For demonstration, we'll fetch the user and check emailVerified status.
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({ success: false, error: 'No user found with this email address.' });
      }
      throw error;
    }
    if (!userRecord.emailVerified) {
      return res.status(403).json({ success: false, error: 'Please verify your email before logging in.' });
    }
    // In production, you should verify the password using Firebase Auth REST API or on the frontend.
    res.status(200).json({ success: true, message: 'Email verified. Proceed to login with Firebase Client SDK.' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Forgot password endpoint
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const link = await admin.auth().generatePasswordResetLink(email);
    // Optionally, you can send this link via your own email service
    res.status(200).json({ success: true, message: 'Password reset email sent', link });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'RideAdvisor API is running' });
});

// Dummy car data
const cars = [
  { id: 1, name: 'Toyota Prius', type: 'eco', price: 20000 },
  { id: 2, name: 'Tesla Model S', type: 'luxury', price: 80000 },
  { id: 3, name: 'Honda Civic', type: 'budget', price: 18000 },
  { id: 4, name: 'BMW 5 Series', type: 'luxury', price: 55000 },
  { id: 5, name: 'Nissan Leaf', type: 'eco', price: 25000 },
  { id: 6, name: 'Kia Rio', type: 'budget', price: 15000 }
];

// ML-like recommendation logic
function recommendCars(avatar) {
  switch (avatar) {
    case 'eco':
      return cars.filter(car => car.type === 'eco');
    case 'luxury':
      return cars.filter(car => car.type === 'luxury');
    case 'budget':
      return cars.filter(car => car.type === 'budget');
    default:
      return cars;
  }
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return normA && normB ? dot / (normA * normB) : 0;
}

// Endpoint for car recommendations (hybrid: content-based + collaborative)
app.post('/recommend-cars', async (req, res) => {
  const { avatar, userId } = req.body;
  if (!avatar) {
    return res.status(400).json({ success: false, error: 'Avatar selection is required.' });
  }

  // Content-based: avatar profile
  let avatarProfile = { eco: [1, 0, 0], luxury: [0, 1, 0], budget: [0, 0, 1] };
  let carFeatureMap = {
    eco: [1, 0, 0],
    luxury: [0, 1, 0],
    budget: [0, 0, 1]
  };
  const avatarVec = avatarProfile[avatar];

  // Collaborative: get feedback from Firestore
  let feedbackMap = {}; // carId -> score
  if (userId) {
    const feedbackSnap = await admin.firestore().collection('feedback').where('avatar', '==', avatar).get();
    feedbackSnap.forEach(doc => {
      const { carId, feedback } = doc.data();
      if (!feedbackMap[carId]) feedbackMap[carId] = 0;
      feedbackMap[carId] += feedback === 'like' ? 1 : -1;
    });
  }

  // Score cars
  const hybridScores = cars.map(car => {
    // Content-based score (cosine similarity)
    const carVec = carFeatureMap[car.type];
    const contentScore = cosineSimilarity(avatarVec, carVec);
    // Collaborative score (normalized)
    const collabScore = feedbackMap[car.id] ? feedbackMap[car.id] / 5 : 0; // scale for demo
    // Hybrid score: weighted sum
    const finalScore = 0.6 * contentScore + 0.4 * collabScore;
    return { ...car, score: finalScore };
  });

  // Sort by score, descending
  hybridScores.sort((a, b) => b.score - a.score);

  res.json({ success: true, recommendations: hybridScores });
});

// List all users (paginated)
app.get('/admin/users', async (req, res) => {
  try {
    const listAllUsers = async (nextPageToken) => {
      return await admin.auth().listUsers(1000, nextPageToken);
    };
    let users = [];
    let result = await listAllUsers();
    users = users.concat(result.users);
    while (result.pageToken) {
      result = await listAllUsers(result.pageToken);
      users = users.concat(result.users);
    }
    // Map to expected frontend format
    const mappedUsers = users.map(u => ({
      id: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
      isBlocked: !!u.disabled
    }));
    res.json({ success: true, users: mappedUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Store user feedback for recommendations
app.post('/feedback', async (req, res) => {
  const { userId, carId, avatar, feedback } = req.body; // feedback: 'like' or 'dislike'
  try {
    await admin.firestore().collection('feedback').add({
      userId,
      carId,
      avatar,
      feedback,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a user by ID
app.delete('/admin/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    await admin.auth().deleteUser(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Block (disable/enable) a user by ID
app.put('/admin/users/:id/block', async (req, res) => {
  const userId = req.params.id;
  const { isBlocked } = req.body;
  try {
    await admin.auth().updateUser(userId, { disabled: !!isBlocked });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Edit a user's displayName and/or email
app.put('/admin/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { displayName, email } = req.body;
  try {
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    await admin.auth().updateUser(userId, updateData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user profile
app.get('/user/profile/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    // Get Auth user
    const userRecord = await admin.auth().getUser(userId);
    // Get Firestore user data
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    res.json({ success: true, user: { ...userData, ...userRecord } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user profile
app.put('/user/profile/:id', async (req, res) => {
  const userId = req.params.id;
  const { displayName, email, phoneNumber } = req.body;
  try {
    // Update Auth user
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (Object.keys(updateData).length > 0) {
      await admin.auth().updateUser(userId, updateData);
    }
    // Update Firestore user data
    await admin.firestore().collection('users').doc(userId).set({
      name: displayName,
      email,
      phoneNumber
    }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get feedback history for a user
app.get('/user/feedback/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const feedbackSnap = await admin.firestore().collection('feedback').where('userId', '==', userId).orderBy('timestamp', 'desc').get();
    const feedback = feedbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all cars
app.get('/cars', (req, res) => {
  res.json({ success: true, cars });
});

// Get user's watchlist
app.get('/user/watchlist/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const snap = await admin.firestore().collection('users').doc(userId).collection('watchlist').get();
    const watchlist = snap.docs.map(doc => doc.data());
    res.json({ success: true, watchlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add car to watchlist
app.post('/user/watchlist/:userId', async (req, res) => {
  const { userId } = req.params;
  const { carId } = req.body;
  try {
    const car = cars.find(c => c.id === carId);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    await admin.firestore().collection('users').doc(userId).collection('watchlist').doc(String(carId)).set(car);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove car from watchlist
app.delete('/user/watchlist/:userId/:carId', async (req, res) => {
  const { userId, carId } = req.params;
  try {
    await admin.firestore().collection('users').doc(userId).collection('watchlist').doc(carId).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DreamFund endpoints

// Get DreamFund data for a user
app.get('/dreamfund/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's DreamFund data from Firestore
    const dreamFundDoc = await admin.firestore().collection('dreamfund').doc(userId).get();
    
    if (!dreamFundDoc.exists) {
      // Initialize DreamFund data for new users
      const initialData = {
        currentPoints: 0,
        totalPointsEarned: 0,
        nextRewardPoints: 1000,
        currentTier: 'Bronze',
        rewardsEarned: [
          {
            id: 'car_wash',
            name: 'Free Car Wash',
            pointsCost: 500,
            description: 'Complimentary car wash service',
            isAvailable: true
          },
          {
            id: 'oil_change',
            name: 'Oil Change Discount',
            pointsCost: 800,
            description: '50% off next oil change',
            isAvailable: true
          },
          {
            id: 'maintenance',
            name: 'Free Maintenance Check',
            pointsCost: 1200,
            description: 'Complimentary maintenance inspection',
            isAvailable: true
          }
        ],
        recentTransactions: []
      };
      
      await admin.firestore().collection('dreamfund').doc(userId).set(initialData);
      
      return res.json({
        success: true,
        dreamFundData: initialData
      });
    }
    
    const dreamFundData = dreamFundDoc.data();
    
    // Calculate tier based on total points earned
    let currentTier = 'Bronze';
    if (dreamFundData.totalPointsEarned >= 5000) {
      currentTier = 'Gold';
    } else if (dreamFundData.totalPointsEarned >= 2000) {
      currentTier = 'Silver';
    }
    
    // Update tier if changed
    if (dreamFundData.currentTier !== currentTier) {
      await admin.firestore().collection('dreamfund').doc(userId).update({
        currentTier: currentTier
      });
      dreamFundData.currentTier = currentTier;
    }
    
    res.json({
      success: true,
      dreamFundData: dreamFundData
    });
    
  } catch (error) {
    console.error('Error fetching DreamFund data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DreamFund data'
    });
  }
});

// Add points to user's DreamFund
app.post('/dreamfund/add-points', async (req, res) => {
  try {
    const { userId, points, description } = req.body;
    
    if (!userId || !points || !description) {
      return res.status(400).json({
        success: false,
        error: 'User ID, points, and description are required'
      });
    }
    
    const dreamFundRef = admin.firestore().collection('dreamfund').doc(userId);
    
    // Use transaction to ensure data consistency
    await admin.firestore().runTransaction(async (transaction) => {
      const dreamFundDoc = await transaction.get(dreamFundRef);
      
      if (!dreamFundDoc.exists) {
        throw new Error('DreamFund account not found');
      }
      
      const currentData = dreamFundDoc.data();
      const newCurrentPoints = currentData.currentPoints + points;
      const newTotalPoints = currentData.totalPointsEarned + points;
      
      // Create transaction record
      const transactionRecord = {
        id: Date.now().toString(),
        type: 'earned',
        points: points,
        description: description,
        date: new Date().toISOString().split('T')[0]
      };
      
      // Update DreamFund data
      transaction.update(dreamFundRef, {
        currentPoints: newCurrentPoints,
        totalPointsEarned: newTotalPoints,
        recentTransactions: admin.firestore.FieldValue.arrayUnion(transactionRecord)
      });
    });
    
    res.json({
      success: true,
      message: 'Points added successfully'
    });
    
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add points'
    });
  }
});

// Redeem reward
app.post('/dreamfund/redeem', async (req, res) => {
  try {
    const { userId, rewardId, pointsCost } = req.body;
    
    if (!userId || !rewardId || !pointsCost) {
      return res.status(400).json({
        success: false,
        error: 'User ID, reward ID, and points cost are required'
      });
    }
    
    const dreamFundRef = admin.firestore().collection('dreamfund').doc(userId);
    
    // Use transaction to ensure data consistency
    await admin.firestore().runTransaction(async (transaction) => {
      const dreamFundDoc = await transaction.get(dreamFundRef);
      
      if (!dreamFundDoc.exists) {
        throw new Error('DreamFund account not found');
      }
      
      const currentData = dreamFundDoc.data();
      
      if (currentData.currentPoints < pointsCost) {
        throw new Error('Insufficient points');
      }
      
      // Find the reward
      const reward = currentData.rewardsEarned.find(r => r.id === rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }
      
      const newCurrentPoints = currentData.currentPoints - pointsCost;
      
      // Create transaction record
      const transactionRecord = {
        id: Date.now().toString(),
        type: 'spent',
        points: -pointsCost,
        description: `Redeemed: ${reward.name}`,
        date: new Date().toISOString().split('T')[0]
      };
      
      // Update reward with earned date
      const updatedRewards = currentData.rewardsEarned.map(r => 
        r.id === rewardId 
          ? { ...r, earnedDate: new Date().toISOString().split('T')[0] }
          : r
      );
      
      // Update DreamFund data
      transaction.update(dreamFundRef, {
        currentPoints: newCurrentPoints,
        rewardsEarned: updatedRewards,
        recentTransactions: admin.firestore.FieldValue.arrayUnion(transactionRecord)
      });
    });
    
    res.json({
      success: true,
      message: 'Reward redeemed successfully'
    });
    
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to redeem reward'
    });
  }
});

// New Endpoints Start Here

// Get deals from user's watchlist
app.get('/deals/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const watchlistDoc = await admin.firestore().collection('watchlists').doc(userId).get();

    if (!watchlistDoc.exists) {
      return res.json({ success: true, deals: [] });
    }

    const watchlistData = watchlistDoc.data();
    const carIds = watchlistData.cars || [];

    if (carIds.length === 0) {
      return res.json({ success: true, deals: [] });
    }

    // In a real app, you'd query your car database. Here we use the dummy 'cars' array.
    const allCars = cars; // using the existing dummy car data
    const watchlistCars = allCars.filter(car => carIds.includes(car.id));

    // Simulate finding deals (e.g., car price dropped)
    const deals = watchlistCars.map(car => {
      const hasDeal = Math.random() > 0.5; // 50% chance of having a deal
      if (hasDeal) {
        const priceDrop = Math.floor(Math.random() * 2000) + 500;
        return {
          ...car,
          hasDeal: true,
          originalPrice: car.price + priceDrop,
          dealDescription: `Price dropped by $${priceDrop}!`
        };
      }
      return { ...car, hasDeal: false };
    }).filter(car => car.hasDeal);

    res.json({ success: true, deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deals' });
  }
});

// Update user preferences
app.put('/user/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { dealAlertsEnabled, newsletterSubscribed } = req.body;

    await admin.firestore().collection('users').doc(userId).set({
      preferences: {
        dealAlertsEnabled,
        newsletterSubscribed
      }
    }, { merge: true });

    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

// Endpoint for changing password (placeholder)
// Note: Actual password changes are best handled on the client with Firebase SDK's `updatePassword` method.
// This endpoint is for demonstrating the flow.
app.post('/user/change-password', async (req, res) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
        return res.status(400).json({ success: false, error: 'User ID and new password are required.' });
    }
    try {
        // In a real scenario, you'd re-authenticate the user before this.
        // The Firebase Admin SDK allows setting a new password.
        await admin.auth().updateUser(userId, {
            password: newPassword
        });
        res.status(200).json({ success: true, message: 'Password updated successfully. Please log in again.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, error: 'An error occurred while changing the password.' });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 