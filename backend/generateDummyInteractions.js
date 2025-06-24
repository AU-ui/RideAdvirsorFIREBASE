const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'http://localhost:8001/interaction';

// Dummy users and cars
const users = [
  { uid: 'user1', name: 'John Doe' },
  { uid: 'user2', name: 'Jane Smith' },
  { uid: 'user3', name: 'Bob Johnson' },
  { uid: 'user4', name: 'Alice Brown' },
  { uid: 'user5', name: 'Charlie Wilson' }
];

const cars = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
];

// Types of interactions with weights
const interactionTypes = [
  { type: 'like', weight: 0.4 },
  { type: 'dislike', weight: 0.2 },
  { type: 'view', weight: 0.2 },
  { type: 'watchlist_add', weight: 0.15 },
  { type: 'watchlist_remove', weight: 0.05 }
];

// Helper function to get random interaction type based on weights
function getRandomInteractionType() {
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const interaction of interactionTypes) {
    cumulativeWeight += interaction.weight;
    if (random <= cumulativeWeight) {
      return interaction.type;
    }
  }
  return 'view'; // fallback
}

async function postInteraction(interaction) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction)
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return data.success;
  } catch (error) {
    console.error('Error posting interaction:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting dummy data generation...');
  console.log(`📊 Generating interactions for ${users.length} users and ${cars.length} cars`);
  
  let successCount = 0;
  let totalCount = 0;
  
  for (const user of users) {
    console.log(`👤 Generating interactions for user: ${user.name} (${user.uid})`);
    
    for (const carId of cars) {
      // Each user interacts with each car in a weighted random way
      const type = getRandomInteractionType();
      
      const interaction = {
        userId: user.uid,
        carId: carId,
        type: type,
        details: { 
          source: 'dummy_script',
          user: user.name,
          timestamp: new Date().toISOString()
        }
      };
      
      const success = await postInteraction(interaction);
      if (success) {
        successCount++;
      }
      totalCount++;
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  console.log('\n✅ Dummy data generation completed!');
  console.log(`📈 Successfully inserted: ${successCount}/${totalCount} interactions`);
  console.log(`👥 Users: ${users.length}`);
  console.log(`🚗 Cars: ${cars.length}`);
  console.log(`🔄 Total interactions: ${totalCount}`);
  
  if (successCount > 0) {
    console.log('\n🎯 Next steps:');
    console.log('1. Export data: http://localhost:8001/export-ml-data');
    console.log('2. Train ML model: http://localhost:8001/ml/train');
    console.log('3. Check ML status: http://localhost:8001/ml/status');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 