const admin = require('./firebase_config');
const fs = require('fs');
const path = require('path');

/**
 * Export user interaction data for ML training
 * This script exports data from Firestore collections and formats it for ML algorithms
 */

async function exportInteractionData() {
  try {
    console.log('🔄 Starting data export for ML training...');
    
    // Get all interactions from Firestore
    const interactionsSnapshot = await admin.firestore().collection('interactions').get();
    const interactions = [];
    
    interactionsSnapshot.forEach(doc => {
      const data = doc.data();
      interactions.push({
        id: doc.id,
        userId: data.userId,
        carId: data.carId,
        type: data.type,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
        details: data.details || {}
      });
    });
    
    console.log(`📊 Found ${interactions.length} interactions`);
    
    // Get all users for reference
    const usersSnapshot = await admin.firestore().collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });
    
    console.log(`👥 Found ${users.length} users`);
    
    // Get car data for reference
    const { cars } = require('./carData');
    console.log(`🚗 Found ${cars.length} cars in database`);
    
    // Create user-car interaction matrix for collaborative filtering
    const userCarMatrix = {};
    const interactionTypes = new Set();
    
    interactions.forEach(interaction => {
      const { userId, carId, type } = interaction;
      
      if (!userCarMatrix[userId]) {
        userCarMatrix[userId] = {};
      }
      
      // Convert interaction types to numerical scores
      let score = 0;
      switch (type) {
        case 'like':
          score = 5;
          break;
        case 'dislike':
          score = 1;
          break;
        case 'watchlist_add':
          score = 4;
          break;
        case 'watchlist_remove':
          score = 2;
          break;
        case 'deal_view':
          score = 3;
          break;
        case 'view':
          score = 2;
          break;
        default:
          score = 1;
      }
      
      // If user has multiple interactions with same car, take the highest score
      if (!userCarMatrix[userId][carId] || userCarMatrix[userId][carId] < score) {
        userCarMatrix[userId][carId] = score;
      }
      
      interactionTypes.add(type);
    });
    
    console.log(`📈 Interaction types found: ${Array.from(interactionTypes).join(', ')}`);
    
    // Create CSV data for ML training
    const csvData = [];
    const headers = ['userId', 'carId', 'rating', 'interaction_count', 'last_interaction'];
    
    // Add headers
    csvData.push(headers.join(','));
    
    // Add data rows
    Object.keys(userCarMatrix).forEach(userId => {
      Object.keys(userCarMatrix[userId]).forEach(carId => {
        const rating = userCarMatrix[userId][carId];
        
        // Count total interactions for this user-car pair
        const interactionCount = interactions.filter(
          i => i.userId === userId && i.carId.toString() === carId.toString()
        ).length;
        
        // Get last interaction timestamp
        const userCarInteractions = interactions.filter(
          i => i.userId === userId && i.carId.toString() === carId.toString()
        );
        const lastInteraction = userCarInteractions.length > 0 
          ? userCarInteractions[userCarInteractions.length - 1].timestamp
          : new Date();
        
        csvData.push([
          userId,
          carId,
          rating,
          interactionCount,
          lastInteraction.toISOString()
        ].join(','));
      });
    });
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'ml_data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Write CSV file
    const csvPath = path.join(outputDir, 'user_car_interactions.csv');
    fs.writeFileSync(csvPath, csvData.join('\n'));
    
    // Create metadata file
    const metadata = {
      exportDate: new Date().toISOString(),
      totalUsers: users.length,
      totalCars: cars.length,
      totalInteractions: interactions.length,
      interactionTypes: Array.from(interactionTypes),
      ratingScale: {
        like: 5,
        dislike: 1,
        watchlist_add: 4,
        watchlist_remove: 2,
        deal_view: 3,
        view: 2
      },
      dataFormat: 'CSV with columns: userId, carId, rating, interaction_count, last_interaction'
    };
    
    const metadataPath = path.join(outputDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Create user features file (for user-based collaborative filtering)
    const userFeatures = users.map(user => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      joinDate: user.createdAt?.toISOString() || new Date().toISOString(),
      totalInteractions: interactions.filter(i => i.userId === user.id).length,
      interactionTypes: Array.from(new Set(
        interactions.filter(i => i.userId === user.id).map(i => i.type)
      ))
    }));
    
    const userFeaturesPath = path.join(outputDir, 'user_features.json');
    fs.writeFileSync(userFeaturesPath, JSON.stringify(userFeatures, null, 2));
    
    // Create car features file
    const carFeatures = cars.map(car => ({
      carId: car.id,
      name: car.name,
      brand: car.brand,
      type: car.type,
      price: car.price,
      features: car.features || [],
      totalInteractions: interactions.filter(i => i.carId.toString() === car.id.toString()).length
    }));
    
    const carFeaturesPath = path.join(outputDir, 'car_features.json');
    fs.writeFileSync(carFeaturesPath, JSON.stringify(carFeatures, null, 2));
    
    console.log('✅ Data export completed successfully!');
    console.log(`📁 Files saved in: ${outputDir}`);
    console.log(`📄 CSV file: ${csvPath}`);
    console.log(`📊 Total user-car interactions: ${csvData.length - 1}`);
    console.log(`👥 Unique users: ${Object.keys(userCarMatrix).length}`);
    console.log(`🚗 Unique cars: ${new Set(Object.values(userCarMatrix).flatMap(Object.keys)).size}`);
    
    return {
      success: true,
      outputDir,
      csvPath,
      totalInteractions: csvData.length - 1,
      uniqueUsers: Object.keys(userCarMatrix).length,
      uniqueCars: new Set(Object.values(userCarMatrix).flatMap(Object.keys)).size
    };
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw error;
  }
}

// Export function for use in other scripts
module.exports = { exportInteractionData };

// Run directly if this script is executed
if (require.main === module) {
  exportInteractionData()
    .then(result => {
      console.log('🎉 Export completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Export failed:', error);
      process.exit(1);
    });
} 