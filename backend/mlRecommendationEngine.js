const fs = require('fs');
const path = require('path');

/**
 * Simple Collaborative Filtering Recommendation Engine
 * Implemented in JavaScript for easy integration with Node.js backend
 */

class CarRecommendationEngine {
  constructor() {
    this.userCarMatrix = {};
    this.userSimilarities = {};
    this.carSimilarities = {};
    this.isTrained = false;
  }

  /**
   * Load interaction data from CSV and build user-car matrix
   */
  loadData(csvPath) {
    try {
      console.log('🔄 Loading interaction data...');
      
      if (!fs.existsSync(csvPath)) {
        console.log('⚠️ No interaction data found. Model will be ready once data is available.');
        return false;
      }

      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length <= 1) {
        console.log('⚠️ No interaction data found. Model will be ready once data is available.');
        return false;
      }

      // Skip header
      const dataLines = lines.slice(1);
      
      // Build user-car matrix
      dataLines.forEach(line => {
        const [userId, carId, rating] = line.split(',');
        if (!this.userCarMatrix[userId]) {
          this.userCarMatrix[userId] = {};
        }
        this.userCarMatrix[userId][carId] = parseFloat(rating);
      });

      console.log(`✅ Loaded data: ${Object.keys(this.userCarMatrix).length} users, ${this.getUniqueCars().length} cars`);
      return true;
    } catch (error) {
      console.error('❌ Error loading data:', error);
      return false;
    }
  }

  /**
   * Get unique cars from the matrix
   */
  getUniqueCars() {
    const cars = new Set();
    Object.values(this.userCarMatrix).forEach(userRatings => {
      Object.keys(userRatings).forEach(carId => cars.add(carId));
    });
    return Array.from(cars);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    const keys = Object.keys(vec1).filter(key => vec2[key] !== undefined);
    if (keys.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    keys.forEach(key => {
      const val1 = vec1[key];
      const val2 = vec2[key];
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Train the collaborative filtering model
   */
  train() {
    console.log('🔄 Training collaborative filtering model...');
    
    const users = Object.keys(this.userCarMatrix);
    const cars = this.getUniqueCars();
    
    if (users.length < 2 || cars.length < 2) {
      console.log('⚠️ Insufficient data for training. Need at least 2 users and 2 cars.');
      return false;
    }

    // Calculate user similarities
    this.userSimilarities = {};
    for (let i = 0; i < users.length; i++) {
      this.userSimilarities[users[i]] = {};
      for (let j = 0; j < users.length; j++) {
        if (i === j) {
          this.userSimilarities[users[i]][users[j]] = 1;
        } else {
          this.userSimilarities[users[i]][users[j]] = this.cosineSimilarity(
            this.userCarMatrix[users[i]],
            this.userCarMatrix[users[j]]
          );
        }
      }
    }

    // Calculate car similarities
    this.carSimilarities = {};
    for (let i = 0; i < cars.length; i++) {
      this.carSimilarities[cars[i]] = {};
      for (let j = 0; j < cars.length; j++) {
        if (i === j) {
          this.carSimilarities[cars[i]][cars[j]] = 1;
        } else {
          // Create car rating vectors
          const car1Ratings = {};
          const car2Ratings = {};
          users.forEach(userId => {
            if (this.userCarMatrix[userId][cars[i]] !== undefined) {
              car1Ratings[userId] = this.userCarMatrix[userId][cars[i]];
            }
            if (this.userCarMatrix[userId][cars[j]] !== undefined) {
              car2Ratings[userId] = this.userCarMatrix[userId][cars[j]];
            }
          });
          
          this.carSimilarities[cars[i]][cars[j]] = this.cosineSimilarity(car1Ratings, car2Ratings);
        }
      }
    }

    this.isTrained = true;
    console.log('✅ Model training completed');
    return true;
  }

  /**
   * Get recommendations for a user using collaborative filtering
   */
  getRecommendations(userId, nRecommendations = 10) {
    if (!this.isTrained) {
      console.log('⚠️ Model not trained yet');
      return [];
    }

    if (!this.userCarMatrix[userId]) {
      console.log(`⚠️ User ${userId} not found in training data`);
      return [];
    }

    const userRatings = this.userCarMatrix[userId];
    const ratedCars = Object.keys(userRatings);
    const allCars = this.getUniqueCars();
    const unratedCars = allCars.filter(carId => !ratedCars.includes(carId));

    if (unratedCars.length === 0) {
      console.log('⚠️ User has rated all available cars');
      return [];
    }

    // Get similar users
    const userSimilarities = Object.entries(this.userSimilarities[userId])
      .filter(([similarUserId, similarity]) => similarUserId !== userId && similarity > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Calculate predicted ratings
    const predictions = {};
    unratedCars.forEach(carId => {
      let weightedSum = 0;
      let similaritySum = 0;

      userSimilarities.forEach(([similarUserId, similarity]) => {
        const similarUserRating = this.userCarMatrix[similarUserId][carId];
        if (similarUserRating !== undefined) {
          weightedSum += similarity * similarUserRating;
          similaritySum += similarity;
        }
      });

      if (similaritySum > 0) {
        predictions[carId] = weightedSum / similaritySum;
      }
    });

    // Sort and return recommendations
    const sortedPredictions = Object.entries(predictions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, nRecommendations);

    return sortedPredictions.map(([carId, score]) => ({
      carId: carId,
      score: parseFloat(score.toFixed(3)),
      method: 'collaborative_filtering'
    }));
  }

  /**
   * Save the trained model
   */
  saveModel(modelPath = 'trained_model.json') {
    try {
      const modelData = {
        userCarMatrix: this.userCarMatrix,
        userSimilarities: this.userSimilarities,
        carSimilarities: this.carSimilarities,
        isTrained: this.isTrained,
        trainedAt: new Date().toISOString()
      };

      fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2));
      console.log(`✅ Model saved to ${modelPath}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving model:', error);
      return false;
    }
  }

  /**
   * Load a trained model
   */
  loadModel(modelPath = 'trained_model.json') {
    try {
      if (!fs.existsSync(modelPath)) {
        console.log(`⚠️ Model file not found: ${modelPath}`);
        return false;
      }

      const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
      this.userCarMatrix = modelData.userCarMatrix;
      this.userSimilarities = modelData.userSimilarities;
      this.carSimilarities = modelData.carSimilarities;
      this.isTrained = modelData.isTrained;

      console.log(`✅ Model loaded from ${modelPath}`);
      return true;
    } catch (error) {
      console.error('❌ Error loading model:', error);
      return false;
    }
  }

  /**
   * Get model statistics
   */
  getStats() {
    const users = Object.keys(this.userCarMatrix);
    const cars = this.getUniqueCars();
    const totalInteractions = users.reduce((sum, userId) => {
      return sum + Object.keys(this.userCarMatrix[userId]).length;
    }, 0);

    return {
      totalUsers: users.length,
      totalCars: cars.length,
      totalInteractions: totalInteractions,
      isTrained: this.isTrained,
      averageInteractionsPerUser: totalInteractions / users.length || 0
    };
  }
}

// Export for use in other modules
module.exports = CarRecommendationEngine;

// Run training if this script is executed directly
if (require.main === module) {
  const engine = new CarRecommendationEngine();
  
  console.log('🚀 Starting Car Recommendation Engine Training');
  
  // Load data
  const csvPath = path.join(__dirname, 'ml_data', 'user_car_interactions.csv');
  if (!engine.loadData(csvPath)) {
    console.log('💤 No data available yet. Model will be ready once users start interacting with cars.');
    process.exit(0);
  }
  
  // Train model
  if (!engine.train()) {
    console.log('💤 Insufficient data for training. Model will be ready once more data is collected.');
    process.exit(0);
  }
  
  // Save model
  engine.saveModel();
  
  // Show stats
  const stats = engine.getStats();
  console.log('📊 Model Statistics:', stats);
  
  // Test recommendations if we have users
  const users = Object.keys(engine.userCarMatrix);
  if (users.length > 0) {
    const testUser = users[0];
    console.log(`🧪 Testing recommendations for user: ${testUser}`);
    
    const recommendations = engine.getRecommendations(testUser, 5);
    console.log(`📋 Generated ${recommendations.length} recommendations:`);
    
    recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. Car ${rec.carId} - Score: ${rec.score}`);
    });
  }
  
  console.log('✅ Training completed successfully!');
} 