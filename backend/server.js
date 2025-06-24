const express = require('express');
const cors = require('cors');
const admin = require('./firebase_config');
const { cars, avatarConfig, recommendationReasons, dummyDeals, starterCars } = require('./carData');
const { exportInteractionData } = require('./exportMLData');
const CarRecommendationEngine = require('./mlRecommendationEngine');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize ML recommendation engine
const mlEngine = new CarRecommendationEngine();

// Load ML model on startup if available
async function loadMLModel() {
  try {
    const modelPath = path.join(__dirname, 'trained_model.json');
    if (mlEngine.loadModel(modelPath)) {
      console.log('✅ ML model loaded successfully on startup');
    } else {
      console.log('ℹ️ No trained ML model found. Model will be trained when data is available.');
    }
  } catch (error) {
    console.log('⚠️ Could not load ML model on startup:', error.message);
  }
}

// Load ML model when server starts
loadMLModel();

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

// Enhanced ML-like recommendation logic with simulated data
function recommendCars(avatar, userPreferences = {}) {
  // Base filtering by avatar type
  let filteredCars = cars.filter(car => car.type === avatar);
  
  // Enhanced scoring based on multiple factors
  const scoredCars = filteredCars.map(car => {
    let score = 0;
    
    // Base score for avatar match
    score += 1.0;
    
    // Price preference scoring
    if (avatar === 'budget' && car.price < 25000) score += 0.5;
    if (avatar === 'luxury' && car.price > 50000) score += 0.5;
    if (avatar === 'eco' && car.mpg > 50) score += 0.3;
    
    // Feature-based scoring
    if (avatar === 'eco' && car.features.includes('electric')) score += 0.4;
    if (avatar === 'eco' && car.features.includes('hybrid')) score += 0.3;
    if (avatar === 'luxury' && car.features.includes('premium')) score += 0.4;
    if (avatar === 'luxury' && car.features.includes('luxury')) score += 0.4;
    if (avatar === 'budget' && car.features.includes('affordable')) score += 0.3;
    if (avatar === 'budget' && car.features.includes('reliable')) score += 0.3;
    
    // Brand preference (simulated)
    const brandPreferences = {
      eco: ['Toyota', 'Tesla', 'Nissan', 'Honda'],
      luxury: ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche'],
      budget: ['Honda', 'Toyota', 'Kia', 'Hyundai', 'Ford']
    };
    
    if (brandPreferences[avatar].includes(car.brand)) {
      score += 0.2;
    }
    
    return { ...car, score };
  });
  
  // Sort by score, then by price for same scores
  scoredCars.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.1) {
      return avatar === 'budget' ? a.price - b.price : b.price - a.price;
    }
    return b.score - a.score;
  });
  
  return scoredCars;
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return normA && normB ? dot / (normA * normB) : 0;
}

// Enhanced endpoint for car recommendations with ML integration
app.post('/recommend-cars', async (req, res) => {
  const { avatar, userId, preferences } = req.body;
  if (!avatar) {
    return res.status(400).json({ success: false, error: 'Avatar selection is required.' });
  }

  try {
    // Initialize recommendations array
    let recommendations = [];
    let mlRecommendations = [];
    let avatarRecommendations = [];

    // 1. Get ML-based recommendations if model is trained and user exists
    if (userId && mlEngine.isTrained) {
      try {
        const mlRecs = mlEngine.getRecommendations(userId, 15);
        mlRecommendations = mlRecs.map(rec => {
          const car = cars.find(c => c.id.toString() === rec.carId);
          return car ? { ...car, mlScore: rec.score, recommendationSource: 'ml' } : null;
        }).filter(car => car !== null);
        
        console.log(`🤖 ML provided ${mlRecommendations.length} recommendations for user ${userId}`);
      } catch (error) {
        console.log('⚠️ ML recommendations failed, falling back to avatar-based:', error.message);
      }
    }

    // 2. Get avatar-based recommendations (existing logic)
    let avatarProfile = { 
      eco: [1, 0, 0, 0.8, 0.9, 0.7],      // [eco, luxury, budget, fuel-efficiency, environmental, practical]
      luxury: [0, 1, 0, 0.3, 0.2, 0.6],   // [eco, luxury, budget, fuel-efficiency, environmental, practical]
      budget: [0, 0, 1, 0.7, 0.5, 0.9]    // [eco, luxury, budget, fuel-efficiency, environmental, practical]
    };
    
    let carFeatureMap = {
      eco: [1, 0, 0, 0.9, 0.9, 0.7],
      luxury: [0, 1, 0, 0.4, 0.3, 0.6],
      budget: [0, 0, 1, 0.8, 0.6, 0.9]
    };
    
    const avatarVec = avatarProfile[avatar];

    // Simulated collaborative feedback (since we don't have real user data)
    let feedbackMap = {};
    if (userId) {
      // Try to get real feedback from Firestore if available
      try {
        const feedbackSnap = await admin.firestore().collection('feedback').where('avatar', '==', avatar).get();
        feedbackSnap.forEach(doc => {
          const { carId, feedback } = doc.data();
          if (!feedbackMap[carId]) feedbackMap[carId] = 0;
          feedbackMap[carId] += feedback === 'like' ? 1 : -1;
        });
      } catch (error) {
        console.log('Using simulated feedback data');
      }
    }

    // Score cars using avatar-based logic
    const avatarScoredCars = cars.map(car => {
      const carVec = carFeatureMap[car.type];
      const contentScore = cosineSimilarity(avatarVec, carVec);
      const collabScore = feedbackMap[car.id] ? feedbackMap[car.id] / 5 : 0;
      const finalScore = 0.6 * contentScore + 0.4 * collabScore;
      return { ...car, avatarScore: finalScore, recommendationSource: 'avatar' };
    });

    // Sort avatar recommendations
    avatarScoredCars.sort((a, b) => b.avatarScore - a.avatarScore);
    avatarRecommendations = avatarScoredCars.slice(0, 15);

    // 3. Combine ML and Avatar recommendations
    if (mlRecommendations.length > 0 && avatarRecommendations.length > 0) {
      // Hybrid approach: Combine both recommendation sources
      const combinedCars = new Map();
      
      // Add ML recommendations with higher weight for users with interaction history
      mlRecommendations.forEach((car, index) => {
        const mlWeight = 0.7; // Higher weight for ML recommendations
        const combinedScore = car.mlScore * mlWeight;
        combinedCars.set(car.id, {
          ...car,
          combinedScore: combinedScore,
          mlRank: index + 1,
          avatarRank: null
        });
      });
      
      // Add avatar recommendations
      avatarRecommendations.forEach((car, index) => {
        const avatarWeight = 0.3; // Lower weight for avatar recommendations
        const existingCar = combinedCars.get(car.id);
        
        if (existingCar) {
          // Car exists in both, combine scores
          existingCar.combinedScore += car.avatarScore * avatarWeight;
          existingCar.avatarRank = index + 1;
        } else {
          // Car only in avatar recommendations
          combinedCars.set(car.id, {
            ...car,
            combinedScore: car.avatarScore * avatarWeight,
            mlRank: null,
            avatarRank: index + 1
          });
        }
      });
      
      // Sort by combined score
      recommendations = Array.from(combinedCars.values())
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, 10);
        
      console.log(`🎯 Hybrid recommendations: ${recommendations.length} cars (ML: ${mlRecommendations.length}, Avatar: ${avatarRecommendations.length})`);
      
    } else if (mlRecommendations.length > 0) {
      // Only ML recommendations available
      recommendations = mlRecommendations.slice(0, 10);
      console.log(`🤖 Using ML-only recommendations: ${recommendations.length} cars`);
      
    } else {
      // Fallback to avatar-based recommendations
      recommendations = avatarRecommendations.slice(0, 10);
      console.log(`👤 Using avatar-only recommendations: ${recommendations.length} cars`);
    }

    // 4. Add recommendation reasons and metadata
    const finalRecommendations = recommendations.map((car, index) => {
      const reason = getRecommendationReason(car, avatar);
      return {
        ...car,
        rank: index + 1,
        reason: reason,
        recommendationMethod: car.recommendationSource || 'avatar',
        confidence: car.mlScore ? Math.min(car.mlScore / 5, 1) : car.avatarScore || 0.5
      };
    });

    res.json({ 
      success: true, 
      recommendations: finalRecommendations,
      metadata: {
        totalCars: finalRecommendations.length,
        mlRecommendations: mlRecommendations.length,
        avatarRecommendations: avatarRecommendations.length,
        hybridMode: mlRecommendations.length > 0 && avatarRecommendations.length > 0,
        modelTrained: mlEngine.isTrained
      }
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate recommendations',
      fallback: true
    });
  }
});

// Helper function to explain recommendations
function getRecommendationReason(car, avatar) {
  const reasons = {
    eco: {
      electric: "Perfect for eco-conscious drivers with zero emissions",
      hybrid: "Great fuel efficiency with hybrid technology",
      highMpg: "Excellent fuel economy for environmental impact"
    },
    luxury: {
      premium: "Premium features and sophisticated design",
      highPrice: "Luxury positioning with premium pricing",
      brand: "Prestigious brand with excellent reputation"
    },
    budget: {
      affordable: "Great value for budget-conscious buyers",
      reliable: "Proven reliability for long-term ownership",
      efficient: "Good fuel efficiency for cost savings"
    }
  };
  
  if (car.features.includes('electric') && avatar === 'eco') return reasons.eco.electric;
  if (car.features.includes('hybrid') && avatar === 'eco') return reasons.eco.hybrid;
  if (car.mpg > 50 && avatar === 'eco') return reasons.eco.highMpg;
  if (car.features.includes('premium') && avatar === 'luxury') return reasons.luxury.premium;
  if (car.price > 50000 && avatar === 'luxury') return reasons.luxury.highPrice;
  if (car.features.includes('affordable') && avatar === 'budget') return reasons.budget.affordable;
  if (car.features.includes('reliable') && avatar === 'budget') return reasons.budget.reliable;
  
  return `Recommended based on ${avatar} preferences and user feedback`;
}

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

// Log user-car interactions for ML training
app.post('/interaction', async (req, res) => {
  /*
    Expected body: {
      userId: string,
      carId: string|number,
      type: 'like' | 'dislike' | 'view' | 'watchlist' | 'skip' | ...,
      details?: object // optional, for extra info (e.g., timestamp, source page)
    }
  */
  try {
    const { userId, carId, type, details } = req.body;
    if (!userId || !carId || !type) {
      return res.status(400).json({ success: false, error: 'userId, carId, and type are required' });
    }
    await admin.firestore().collection('interactions').add({
      userId,
      carId,
      type,
      details: details || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });

    // Retrain ML model in the background (non-blocking)
    (async () => {
      try {
        const csvPath = path.join(__dirname, 'ml_data', 'user_car_interactions.csv');
        await exportInteractionData(); // This will also retrain and save the model
        // Optionally, you can log or notify here
        console.log('✅ ML model retrained after new interaction');
      } catch (err) {
        console.error('❌ Error retraining ML model after interaction:', err.message);
      }
    })();

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
      
      // Update reward with earned date and mark as unavailable
      const updatedRewards = currentData.rewardsEarned.map(r => 
        r.id === rewardId 
          ? { 
              ...r, 
              earnedDate: new Date().toISOString().split('T')[0],
              isAvailable: false 
            }
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

// Export interactions data for ML training
app.get('/export-interactions', async (req, res) => {
  try {
    const { format = 'json', limit = 1000 } = req.query;
    
    // Get all interactions from Firestore
    const interactionsSnap = await admin.firestore()
      .collection('interactions')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const interactions = interactionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
    }));
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['userId', 'carId', 'type', 'timestamp', 'details'];
      const csvRows = interactions.map(interaction => [
        interaction.userId,
        interaction.carId,
        interaction.type,
        interaction.timestamp,
        JSON.stringify(interaction.details || {})
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="interactions.csv"');
      res.send(csvContent);
    } else {
      // Return as JSON
      res.json({
        success: true,
        count: interactions.length,
        interactions: interactions
      });
    }
  } catch (error) {
    console.error('Error exporting interactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export user feedback data for ML training
app.get('/export-feedback', async (req, res) => {
  try {
    const { format = 'json', limit = 1000 } = req.query;
    
    // Get all feedback from Firestore
    const feedbackSnap = await admin.firestore()
      .collection('feedback')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const feedback = feedbackSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
    }));
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['userId', 'carId', 'avatar', 'feedback', 'timestamp'];
      const csvRows = feedback.map(item => [
        item.userId,
        item.carId,
        item.avatar,
        item.feedback,
        item.timestamp
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="feedback.csv"');
      res.send(csvContent);
    } else {
      // Return as JSON
      res.json({
        success: true,
        count: feedback.length,
        feedback: feedback
      });
    }
  } catch (error) {
    console.error('Error exporting feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export ML training data and retrain ML model automatically
app.get('/export-ml-data', async (req, res) => {
  try {
    console.log('🔄 Starting ML data export via API...');
    const result = await exportInteractionData();

    // Automatically retrain ML model after export
    const csvPath = path.join(__dirname, 'ml_data', 'user_car_interactions.csv');
    const dataLoaded = mlEngine.loadData(csvPath);
    let trainingSuccess = false;
    let stats = null;
    if (dataLoaded) {
      trainingSuccess = mlEngine.train();
      if (trainingSuccess) {
        mlEngine.saveModel();
        stats = mlEngine.getStats();
      }
    }

    res.json({
      success: true,
      message: 'ML data exported and model retrained successfully',
      export: result,
      modelTrained: trainingSuccess,
      stats: stats
    });
  } catch (error) {
    console.error('❌ Error exporting ML data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export and retrain ML data',
      details: error.message
    });
  }
});

// Train ML recommendation model
app.post('/ml/train', async (req, res) => {
  try {
    console.log('🔄 Starting ML model training...');
    
    // First export the latest data
    await exportInteractionData();
    
    // Load data into ML engine
    const csvPath = path.join(__dirname, 'ml_data', 'user_car_interactions.csv');
    const dataLoaded = mlEngine.loadData(csvPath);
    
    if (!dataLoaded) {
      return res.json({
        success: false,
        message: 'No interaction data available for training. Users need to interact with cars first.'
      });
    }
    
    // Train the model
    const trainingSuccess = mlEngine.train();
    
    if (!trainingSuccess) {
      return res.json({
        success: false,
        message: 'Insufficient data for training. Need at least 2 users and 2 cars with interactions.'
      });
    }
    
    // Save the trained model
    mlEngine.saveModel();
    
    // Get model statistics
    const stats = mlEngine.getStats();
    
    res.json({
      success: true,
      message: 'ML model trained successfully',
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ Error training ML model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to train ML model',
      details: error.message
    });
  }
});

// Get ML-based recommendations
app.post('/ml/recommendations', async (req, res) => {
  try {
    const { userId, nRecommendations = 10 } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    // Check if model is trained
    if (!mlEngine.isTrained) {
      return res.json({
        success: false,
        message: 'ML model not trained yet. Please train the model first.',
        recommendations: []
      });
    }
    
    // Get recommendations
    const recommendations = mlEngine.getRecommendations(userId, nRecommendations);
    
    // Get car details for recommendations
    const carDetails = recommendations.map(rec => {
      const car = cars.find(c => c.id.toString() === rec.carId);
      return {
        ...rec,
        car: car || { id: rec.carId, name: 'Unknown Car' }
      };
    });
    
    res.json({
      success: true,
      recommendations: carDetails,
      totalFound: recommendations.length
    });
    
  } catch (error) {
    console.error('❌ Error getting ML recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ML recommendations',
      details: error.message
    });
  }
});

// Get ML model status
app.get('/ml/status', (req, res) => {
  try {
    const stats = mlEngine.getStats();
    res.json({
      success: true,
      isTrained: mlEngine.isTrained,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get ML model status'
    });
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 