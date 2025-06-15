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
    // Content-based score (dot product)
    const contentScore = avatarProfile[avatar].reduce((sum, v, i) => sum + v * carFeatureMap[car.type][i], 0);
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 