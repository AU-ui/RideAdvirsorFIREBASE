const admin = require('firebase-admin');
const serviceAccount = require('./firebase_config');

const DUMMY_POINTS = 3000;
const DUMMY_DESC = 'Additional points for DreamFund testing';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function addDummyPointsToAllUsers() {
  try {
    const usersSnap = await admin.firestore().collection('users').get();
    const users = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    console.log(`Found ${users.length} users to add DreamFund points to...`);

    for (const user of users) {
      try {
        const dreamFundRef = admin.firestore().collection('dreamfund').doc(user.uid);
        
        // Use transaction to ensure data consistency
        await admin.firestore().runTransaction(async (transaction) => {
          const dreamFundDoc = await transaction.get(dreamFundRef);
          
          let currentData;
          if (!dreamFundDoc.exists) {
            // Initialize DreamFund data for new users
            currentData = {
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
          } else {
            currentData = dreamFundDoc.data();
          }
          
          const newCurrentPoints = currentData.currentPoints + DUMMY_POINTS;
          const newTotalPoints = currentData.totalPointsEarned + DUMMY_POINTS;
          
          // Create transaction record
          const transactionRecord = {
            id: Date.now().toString(),
            type: 'earned',
            points: DUMMY_POINTS,
            description: DUMMY_DESC,
            date: new Date().toISOString().split('T')[0]
          };
          
          // Update DreamFund data
          transaction.set(dreamFundRef, {
            currentPoints: newCurrentPoints,
            totalPointsEarned: newTotalPoints,
            nextRewardPoints: currentData.nextRewardPoints,
            currentTier: currentData.currentTier,
            rewardsEarned: currentData.rewardsEarned,
            recentTransactions: admin.firestore.FieldValue.arrayUnion(transactionRecord)
          });
        });
        
        console.log(`✅ Added ${DUMMY_POINTS} DreamPoints to user ${user.uid} (${user.name || user.email})`);
        
      } catch (err) {
        console.error(`❌ Error for user ${user.uid}:`, err.message);
      }
    }
    
    console.log('\n🎉 DreamFund points added successfully!');
    console.log('💡 Now log in as any user and check the DreamFund dashboard to see the points and tier.');
    
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
  }
  
  process.exit(0);
}

addDummyPointsToAllUsers(); 