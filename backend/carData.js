// Comprehensive USA-based simulated car database
const cars = [
  // ECO-FRIENDLY CARS (Electric & Hybrid)
  { id: 1, name: 'Toyota Prius', type: 'eco', category: 'hybrid', price: 24525, year: 2024, mpg: 52, features: ['hybrid', 'fuel-efficient', 'reliable'], brand: 'Toyota', madeIn: 'USA' },
  { id: 2, name: 'Nissan Leaf', type: 'eco', category: 'electric', price: 28140, year: 2024, mpg: 123, features: ['electric', 'zero-emissions', 'quiet'], brand: 'Nissan', madeIn: 'USA' },
  { id: 3, name: 'Tesla Model 3', type: 'eco', category: 'electric', price: 38990, year: 2024, mpg: 132, features: ['electric', 'autopilot', 'fast'], brand: 'Tesla', madeIn: 'USA' },
  { id: 4, name: 'Honda Insight', type: 'eco', category: 'hybrid', price: 23200, year: 2024, mpg: 55, features: ['hybrid', 'stylish', 'efficient'], brand: 'Honda', madeIn: 'USA' },
  { id: 5, name: 'Chevrolet Bolt EV', type: 'eco', category: 'electric', price: 26595, year: 2024, mpg: 120, features: ['electric', 'affordable', 'practical'], brand: 'Chevrolet', madeIn: 'USA' },
  { id: 6, name: 'Ford Mustang Mach-E', type: 'eco', category: 'electric', price: 42995, year: 2024, mpg: 100, features: ['electric', 'sporty', 'suv'], brand: 'Ford', madeIn: 'USA' },
  { id: 7, name: 'Hyundai Ioniq 5', type: 'eco', category: 'electric', price: 41550, year: 2024, mpg: 110, features: ['electric', 'futuristic', 'fast-charging'], brand: 'Hyundai', madeIn: 'Korea' },
  { id: 8, name: 'Kia Niro EV', type: 'eco', category: 'electric', price: 39550, year: 2024, mpg: 105, features: ['electric', 'crossover', 'practical'], brand: 'Kia', madeIn: 'Korea' },
  { id: 9, name: 'Tesla Model Y', type: 'eco', category: 'electric', price: 44990, year: 2024, mpg: 115, features: ['electric', 'suv', 'autopilot'], brand: 'Tesla', madeIn: 'USA' },
  { id: 10, name: 'Toyota RAV4 Hybrid', type: 'eco', category: 'hybrid', price: 32500, year: 2024, mpg: 40, features: ['hybrid', 'suv', 'reliable'], brand: 'Toyota', madeIn: 'USA' },
  { id: 11, name: 'Honda CR-V Hybrid', type: 'eco', category: 'hybrid', price: 33500, year: 2024, mpg: 38, features: ['hybrid', 'suv', 'spacious'], brand: 'Honda', madeIn: 'USA' },
  { id: 12, name: 'Ford Escape Hybrid', type: 'eco', category: 'hybrid', price: 31500, year: 2024, mpg: 41, features: ['hybrid', 'suv', 'practical'], brand: 'Ford', madeIn: 'USA' },
  { id: 13, name: 'Chevrolet Equinox', type: 'eco', category: 'gas', price: 26500, year: 2024, mpg: 31, features: ['efficient', 'suv', 'affordable'], brand: 'Chevrolet', madeIn: 'USA' },
  { id: 14, name: 'Volkswagen ID.4', type: 'eco', category: 'electric', price: 38995, year: 2024, mpg: 107, features: ['electric', 'german', 'practical'], brand: 'Volkswagen', madeIn: 'Germany' },
  { id: 15, name: 'Audi Q4 e-tron', type: 'eco', category: 'electric', price: 49900, year: 2024, mpg: 115, features: ['electric', 'luxury', 'premium'], brand: 'Audi', madeIn: 'Germany' },

  // LUXURY CARS (Premium & High-End)
  { id: 16, name: 'BMW 5 Series', type: 'luxury', category: 'sedan', price: 55000, year: 2024, mpg: 28, features: ['premium', 'sporty', 'technology'], brand: 'BMW', madeIn: 'Germany' },
  { id: 17, name: 'Mercedes-Benz E-Class', type: 'luxury', category: 'sedan', price: 58000, year: 2024, mpg: 26, features: ['luxury', 'comfort', 'elegant'], brand: 'Mercedes-Benz', madeIn: 'Germany' },
  { id: 18, name: 'Audi A6', type: 'luxury', category: 'sedan', price: 56000, year: 2024, mpg: 27, features: ['premium', 'quattro', 'sophisticated'], brand: 'Audi', madeIn: 'Germany' },
  { id: 19, name: 'Lexus LS', type: 'luxury', category: 'sedan', price: 78000, year: 2024, mpg: 25, features: ['luxury', 'reliable', 'quiet'], brand: 'Lexus', madeIn: 'Japan' },
  { id: 20, name: 'Tesla Model S', type: 'luxury', category: 'electric', price: 89990, year: 2024, mpg: 120, features: ['electric', 'luxury', 'autopilot'], brand: 'Tesla', madeIn: 'USA' },
  { id: 21, name: 'Porsche 911', type: 'luxury', category: 'sports', price: 106100, year: 2024, mpg: 20, features: ['sports', 'premium', 'iconic'], brand: 'Porsche', madeIn: 'Germany' },
  { id: 22, name: 'Range Rover Sport', type: 'luxury', category: 'suv', price: 85000, year: 2024, mpg: 19, features: ['luxury', 'off-road', 'premium'], brand: 'Land Rover', madeIn: 'UK' },
  { id: 23, name: 'Bentley Continental GT', type: 'luxury', category: 'grand-tourer', price: 220000, year: 2024, mpg: 16, features: ['ultra-luxury', 'handcrafted', 'exclusive'], brand: 'Bentley', madeIn: 'UK' },
  { id: 24, name: 'BMW X5', type: 'luxury', category: 'suv', price: 65000, year: 2024, mpg: 22, features: ['luxury', 'suv', 'sporty'], brand: 'BMW', madeIn: 'USA' },
  { id: 25, name: 'Mercedes-Benz GLE', type: 'luxury', category: 'suv', price: 58000, year: 2024, mpg: 23, features: ['luxury', 'suv', 'comfort'], brand: 'Mercedes-Benz', madeIn: 'USA' },
  { id: 26, name: 'Audi Q7', type: 'luxury', category: 'suv', price: 59000, year: 2024, mpg: 21, features: ['luxury', 'suv', 'quattro'], brand: 'Audi', madeIn: 'Slovakia' },
  { id: 27, name: 'Lexus RX', type: 'luxury', category: 'suv', price: 48000, year: 2024, mpg: 29, features: ['luxury', 'suv', 'reliable'], brand: 'Lexus', madeIn: 'Canada' },
  { id: 28, name: 'Cadillac Escalade', type: 'luxury', category: 'suv', price: 79000, year: 2024, mpg: 18, features: ['luxury', 'suv', 'american'], brand: 'Cadillac', madeIn: 'USA' },
  { id: 29, name: 'Lincoln Navigator', type: 'luxury', category: 'suv', price: 78000, year: 2024, mpg: 19, features: ['luxury', 'suv', 'american'], brand: 'Lincoln', madeIn: 'USA' },
  { id: 30, name: 'Genesis GV80', type: 'luxury', category: 'suv', price: 57000, year: 2024, mpg: 23, features: ['luxury', 'suv', 'korean'], brand: 'Genesis', madeIn: 'Korea' },

  // BUDGET CARS (Affordable & Practical)
  { id: 31, name: 'Honda Civic', type: 'budget', category: 'sedan', price: 23950, year: 2024, mpg: 33, features: ['reliable', 'fuel-efficient', 'practical'], brand: 'Honda', madeIn: 'USA' },
  { id: 32, name: 'Toyota Corolla', type: 'budget', category: 'sedan', price: 21500, year: 2024, mpg: 32, features: ['reliable', 'affordable', 'efficient'], brand: 'Toyota', madeIn: 'USA' },
  { id: 33, name: 'Kia Rio', type: 'budget', category: 'subcompact', price: 16550, year: 2024, mpg: 36, features: ['affordable', 'compact', 'efficient'], brand: 'Kia', madeIn: 'Korea' },
  { id: 34, name: 'Nissan Versa', type: 'budget', category: 'subcompact', price: 15980, year: 2024, mpg: 35, features: ['affordable', 'basic', 'reliable'], brand: 'Nissan', madeIn: 'Mexico' },
  { id: 35, name: 'Hyundai Accent', type: 'budget', category: 'subcompact', price: 16100, year: 2024, mpg: 33, features: ['affordable', 'warranty', 'practical'], brand: 'Hyundai', madeIn: 'Korea' },
  { id: 36, name: 'Mitsubishi Mirage', type: 'budget', category: 'subcompact', price: 14995, year: 2024, mpg: 39, features: ['affordable', 'fuel-efficient', 'basic'], brand: 'Mitsubishi', madeIn: 'Thailand' },
  { id: 37, name: 'Chevrolet Spark', type: 'budget', category: 'subcompact', price: 14200, year: 2024, mpg: 33, features: ['affordable', 'compact', 'city-friendly'], brand: 'Chevrolet', madeIn: 'Korea' },
  { id: 38, name: 'Ford Fiesta', type: 'budget', category: 'subcompact', price: 14850, year: 2024, mpg: 31, features: ['affordable', 'fun-to-drive', 'compact'], brand: 'Ford', madeIn: 'Mexico' },
  { id: 39, name: 'Toyota Camry', type: 'budget', category: 'sedan', price: 26500, year: 2024, mpg: 32, features: ['reliable', 'midsize', 'efficient'], brand: 'Toyota', madeIn: 'USA' },
  { id: 40, name: 'Honda Accord', type: 'budget', category: 'sedan', price: 27200, year: 2024, mpg: 30, features: ['reliable', 'midsize', 'practical'], brand: 'Honda', madeIn: 'USA' },
  { id: 41, name: 'Nissan Sentra', type: 'budget', category: 'sedan', price: 20500, year: 2024, mpg: 33, features: ['affordable', 'compact', 'efficient'], brand: 'Nissan', madeIn: 'Mexico' },
  { id: 42, name: 'Mazda 3', type: 'budget', category: 'sedan', price: 22500, year: 2024, mpg: 31, features: ['stylish', 'compact', 'fun-to-drive'], brand: 'Mazda', madeIn: 'Mexico' },
  { id: 43, name: 'Subaru Impreza', type: 'budget', category: 'sedan', price: 23500, year: 2024, mpg: 30, features: ['awd', 'compact', 'reliable'], brand: 'Subaru', madeIn: 'USA' },
  { id: 44, name: 'Volkswagen Jetta', type: 'budget', category: 'sedan', price: 20500, year: 2024, mpg: 31, features: ['german', 'compact', 'efficient'], brand: 'Volkswagen', madeIn: 'Mexico' },
  { id: 45, name: 'Kia Forte', type: 'budget', category: 'sedan', price: 19500, year: 2024, mpg: 32, features: ['affordable', 'compact', 'warranty'], brand: 'Kia', madeIn: 'Korea' },

  // FAMILY SUVs & CROSSOVERS
  { id: 46, name: 'Toyota RAV4', type: 'budget', category: 'suv', price: 28475, year: 2024, mpg: 30, features: ['reliable', 'practical', 'family-friendly'], brand: 'Toyota', madeIn: 'USA' },
  { id: 47, name: 'Honda CR-V', type: 'budget', category: 'suv', price: 29500, year: 2024, mpg: 29, features: ['reliable', 'spacious', 'efficient'], brand: 'Honda', madeIn: 'USA' },
  { id: 48, name: 'Ford Escape', type: 'budget', category: 'suv', price: 27500, year: 2024, mpg: 28, features: ['practical', 'versatile', 'affordable'], brand: 'Ford', madeIn: 'USA' },
  { id: 49, name: 'Mazda CX-5', type: 'budget', category: 'suv', price: 26500, year: 2024, mpg: 28, features: ['stylish', 'fun-to-drive', 'reliable'], brand: 'Mazda', madeIn: 'Japan' },
  { id: 50, name: 'Nissan Rogue', type: 'budget', category: 'suv', price: 28500, year: 2024, mpg: 30, features: ['practical', 'spacious', 'efficient'], brand: 'Nissan', madeIn: 'USA' },
  { id: 51, name: 'Hyundai Tucson', type: 'budget', category: 'suv', price: 26500, year: 2024, mpg: 29, features: ['stylish', 'practical', 'warranty'], brand: 'Hyundai', madeIn: 'Korea' },
  { id: 52, name: 'Kia Sportage', type: 'budget', category: 'suv', price: 25500, year: 2024, mpg: 28, features: ['affordable', 'practical', 'warranty'], brand: 'Kia', madeIn: 'Korea' },
  { id: 53, name: 'Subaru Forester', type: 'budget', category: 'suv', price: 26500, year: 2024, mpg: 29, features: ['awd', 'practical', 'reliable'], brand: 'Subaru', madeIn: 'Japan' },
  { id: 54, name: 'Volkswagen Tiguan', type: 'budget', category: 'suv', price: 27500, year: 2024, mpg: 27, features: ['german', 'practical', 'premium'], brand: 'Volkswagen', madeIn: 'Mexico' },
  { id: 55, name: 'Chevrolet Equinox', type: 'budget', category: 'suv', price: 26500, year: 2024, mpg: 31, features: ['practical', 'efficient', 'american'], brand: 'Chevrolet', madeIn: 'USA' },

  // TRUCKS & LARGE SUVs
  { id: 56, name: 'Ford F-150', type: 'budget', category: 'truck', price: 34585, year: 2024, mpg: 20, features: ['truck', 'powerful', 'american'], brand: 'Ford', madeIn: 'USA' },
  { id: 57, name: 'Chevrolet Silverado', type: 'budget', category: 'truck', price: 36500, year: 2024, mpg: 19, features: ['truck', 'powerful', 'american'], brand: 'Chevrolet', madeIn: 'USA' },
  { id: 58, name: 'Ram 1500', type: 'budget', category: 'truck', price: 38000, year: 2024, mpg: 21, features: ['truck', 'powerful', 'american'], brand: 'Ram', madeIn: 'USA' },
  { id: 59, name: 'Toyota Tundra', type: 'budget', category: 'truck', price: 38500, year: 2024, mpg: 18, features: ['truck', 'reliable', 'japanese'], brand: 'Toyota', madeIn: 'USA' },
  { id: 60, name: 'GMC Sierra', type: 'budget', category: 'truck', price: 37500, year: 2024, mpg: 19, features: ['truck', 'premium', 'american'], brand: 'GMC', madeIn: 'USA' },
  { id: 61, name: 'Nissan Titan', type: 'budget', category: 'truck', price: 39500, year: 2024, mpg: 17, features: ['truck', 'reliable', 'japanese'], brand: 'Nissan', madeIn: 'USA' },
  { id: 62, name: 'Honda Ridgeline', type: 'budget', category: 'truck', price: 38500, year: 2024, mpg: 22, features: ['truck', 'practical', 'japanese'], brand: 'Honda', madeIn: 'USA' },
  { id: 63, name: 'Ford Expedition', type: 'budget', category: 'suv', price: 52000, year: 2024, mpg: 18, features: ['large-suv', 'powerful', 'american'], brand: 'Ford', madeIn: 'USA' },
  { id: 64, name: 'Chevrolet Tahoe', type: 'budget', category: 'suv', price: 54000, year: 2024, mpg: 17, features: ['large-suv', 'powerful', 'american'], brand: 'Chevrolet', madeIn: 'USA' },
  { id: 65, name: 'Toyota Sequoia', type: 'budget', category: 'suv', price: 58000, year: 2024, mpg: 16, features: ['large-suv', 'reliable', 'japanese'], brand: 'Toyota', madeIn: 'USA' },

  // SPORTS CARS & PERFORMANCE
  { id: 66, name: 'Ford Mustang', type: 'luxury', category: 'sports', price: 28500, year: 2024, mpg: 22, features: ['sports', 'american', 'iconic'], brand: 'Ford', madeIn: 'USA' },
  { id: 67, name: 'Chevrolet Camaro', type: 'luxury', category: 'sports', price: 26500, year: 2024, mpg: 21, features: ['sports', 'american', 'powerful'], brand: 'Chevrolet', madeIn: 'USA' },
  { id: 68, name: 'Dodge Challenger', type: 'luxury', category: 'sports', price: 32000, year: 2024, mpg: 19, features: ['sports', 'american', 'muscle'], brand: 'Dodge', madeIn: 'USA' },
  { id: 69, name: 'BMW M3', type: 'luxury', category: 'sports', price: 75000, year: 2024, mpg: 18, features: ['sports', 'german', 'premium'], brand: 'BMW', madeIn: 'Germany' },
  { id: 70, name: 'Mercedes-AMG C63', type: 'luxury', category: 'sports', price: 78000, year: 2024, mpg: 17, features: ['sports', 'german', 'luxury'], brand: 'Mercedes-Benz', madeIn: 'Germany' },
  { id: 71, name: 'Audi RS5', type: 'luxury', category: 'sports', price: 76000, year: 2024, mpg: 19, features: ['sports', 'german', 'quattro'], brand: 'Audi', madeIn: 'Germany' },
  { id: 72, name: 'Lexus RC F', type: 'luxury', category: 'sports', price: 67000, year: 2024, mpg: 20, features: ['sports', 'japanese', 'reliable'], brand: 'Lexus', madeIn: 'Japan' },
  { id: 73, name: 'Nissan Z', type: 'luxury', category: 'sports', price: 42000, year: 2024, mpg: 22, features: ['sports', 'japanese', 'affordable'], brand: 'Nissan', madeIn: 'Japan' },
  { id: 74, name: 'Subaru WRX', type: 'budget', category: 'sports', price: 31000, year: 2024, mpg: 23, features: ['sports', 'awd', 'japanese'], brand: 'Subaru', madeIn: 'Japan' },
  { id: 75, name: 'Volkswagen Golf GTI', type: 'budget', category: 'sports', price: 30500, year: 2024, mpg: 25, features: ['sports', 'german', 'hot-hatch'], brand: 'Volkswagen', madeIn: 'Germany' }
];

// Avatar configuration data
const avatarConfig = {
  avatars: [
    { id: 'eco', name: 'Eco Advisor', description: 'Recommends eco-friendly cars.', icon: '🌱' },
    { id: 'luxury', name: 'Luxury Guru', description: 'Recommends luxury cars.', icon: '💎' },
    { id: 'budget', name: 'Budget Buddy', description: 'Recommends budget cars.', icon: '💰' }
  ],
  
  // Enhanced avatar profiles with more features
  profiles: { 
    eco: [1, 0, 0, 0.9, 0.9, 0.7, 0.8, 0.6],      // [eco, luxury, budget, fuel-efficiency, environmental, practical, electric, hybrid]
    luxury: [0, 1, 0, 0.3, 0.2, 0.6, 0.4, 0.3],   // [eco, luxury, budget, fuel-efficiency, environmental, practical, electric, hybrid]
    budget: [0, 0, 1, 0.7, 0.5, 0.9, 0.5, 0.6]    // [eco, luxury, budget, fuel-efficiency, environmental, practical, electric, hybrid]
  },
  
  // Enhanced car feature mapping
  carFeatureMap: {
    eco: [1, 0, 0, 0.9, 0.9, 0.7, 0.8, 0.6],
    luxury: [0, 1, 0, 0.4, 0.3, 0.6, 0.4, 0.3],
    budget: [0, 0, 1, 0.8, 0.6, 0.9, 0.5, 0.6]
  },
  
  // USA-focused brand preferences by avatar
  brandPreferences: {
    eco: ['Tesla', 'Toyota', 'Honda', 'Nissan', 'Chevrolet', 'Ford'],
    luxury: ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Cadillac', 'Lincoln'],
    budget: ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'Kia', 'Hyundai', 'Nissan']
  },
  
  // Enhanced simulated feedback data based on USA market
  simulatedFeedback: {
    eco: { 
      1: 3, 2: 2, 3: 4, 4: 2, 5: 3, 6: 3, 7: 2, 8: 2, 9: 4, 10: 3, 11: 3, 12: 3, 13: 2, 14: 3, 15: 2 
    },
    luxury: { 
      16: 3, 17: 4, 18: 3, 19: 4, 20: 4, 21: 4, 22: 3, 23: 5, 24: 3, 25: 3, 26: 3, 27: 4, 28: 3, 29: 3, 30: 2 
    },
    budget: { 
      31: 4, 32: 4, 33: 2, 34: 1, 35: 2, 36: 1, 37: 1, 38: 2, 39: 4, 40: 4, 41: 2, 42: 3, 43: 3, 44: 2, 45: 2 
    }
  }
};

// Enhanced recommendation reasons for USA market
const recommendationReasons = {
  eco: {
    electric: "Perfect for eco-conscious drivers with zero emissions and federal tax credits",
    hybrid: "Great fuel efficiency with hybrid technology for American roads",
    highMpg: "Excellent fuel economy for environmental impact and cost savings",
    madeInUSA: "Built in the USA supporting American manufacturing",
    tesla: "Leading electric vehicle technology with extensive Supercharger network"
  },
  luxury: {
    premium: "Premium features and sophisticated design for discerning buyers",
    highPrice: "Luxury positioning with premium pricing and exclusivity",
    brand: "Prestigious brand with excellent reputation and resale value",
    german: "German engineering with precision and performance",
    american: "American luxury with comfort and style"
  },
  budget: {
    affordable: "Great value for budget-conscious American buyers",
    reliable: "Proven reliability for long-term ownership and low maintenance",
    efficient: "Good fuel efficiency for cost savings on American roads",
    madeInUSA: "Built in the USA supporting American jobs",
    warranty: "Excellent warranty coverage for peace of mind"
  }
};

// Enhanced dummy deal alerts data for USA market
const dummyDeals = [
  {
    id: 1,
    name: "2024 Tesla Model 3",
    type: "Electric Sedan",
    price: 38990,
    originalPrice: 42990,
    dealDescription: "🔥 Price Drop Alert! $4,000 off MSRP + $7,500 Federal Tax Credit",
    savings: 11500,
    dealType: "price_drop",
    location: "Nationwide"
  },
  {
    id: 2,
    name: "2024 BMW X3",
    type: "Luxury SUV",
    price: 48500,
    originalPrice: 52000,
    dealDescription: "💳 0% APR for 60 months + $2,500 cashback + Free Maintenance",
    savings: 3500,
    dealType: "financing",
    location: "Nationwide"
  },
  {
    id: 3,
    name: "2024 Honda CR-V",
    type: "Compact SUV",
    price: 28900,
    originalPrice: 31500,
    dealDescription: "💰 $2,600 price reduction + $1,000 trade-in bonus + 0.9% APR",
    savings: 3600,
    dealType: "trade_in",
    location: "Nationwide"
  },
  {
    id: 4,
    name: "2024 Ford Mustang",
    type: "Sports Car",
    price: 35900,
    originalPrice: 38500,
    dealDescription: "⚡ Flash Sale! $2,600 off + $500 cashback + 0% APR for 72 months",
    savings: 3100,
    dealType: "cashback",
    location: "Nationwide"
  },
  {
    id: 5,
    name: "2024 Toyota Camry",
    type: "Sedan",
    price: 26900,
    originalPrice: 29500,
    dealDescription: "🎯 Limited Time: $2,600 discount + 0% APR + Free Maintenance",
    savings: 2600,
    dealType: "price_drop",
    location: "Nationwide"
  },
  {
    id: 6,
    name: "2024 Chevrolet Silverado",
    type: "Truck",
    price: 36500,
    originalPrice: 39500,
    dealDescription: "🚛 Truck Month! $3,000 off + $1,500 trade-in + 0% APR",
    savings: 4500,
    dealType: "truck_month",
    location: "Nationwide"
  },
  {
    id: 7,
    name: "2024 Lexus RX",
    type: "Luxury SUV",
    price: 48000,
    originalPrice: 52000,
    dealDescription: "💎 Luxury Event! $4,000 off + Free Maintenance + 0.9% APR",
    savings: 4000,
    dealType: "luxury_event",
    location: "Nationwide"
  },
  {
    id: 8,
    name: "2024 Hyundai Tucson",
    type: "Compact SUV",
    price: 26500,
    originalPrice: 28500,
    dealDescription: "🌟 Hyundai Days! $2,000 off + 0% APR + 10-year warranty",
    savings: 2000,
    dealType: "brand_event",
    location: "Nationwide"
  }
];

// Enhanced starter cars for new users (USA market)
const starterCars = [
  { id: 9001, name: 'Toyota RAV4', type: 'SUV', price: 28475, madeIn: 'USA' },
  { id: 9002, name: 'Ford F-150', type: 'Truck', price: 34585, madeIn: 'USA' },
  { id: 9003, name: 'Tesla Model Y', type: 'Electric SUV', price: 44990, madeIn: 'USA' },
  { id: 9004, name: 'Honda Civic', type: 'Sedan', price: 23950, madeIn: 'USA' },
  { id: 9005, name: 'Chevrolet Equinox', type: 'SUV', price: 26500, madeIn: 'USA' },
  { id: 9006, name: 'BMW X3', type: 'Luxury SUV', price: 48500, madeIn: 'USA' },
  { id: 9007, name: 'Toyota Camry', type: 'Sedan', price: 26500, madeIn: 'USA' },
  { id: 9008, name: 'Honda CR-V', type: 'SUV', price: 29500, madeIn: 'USA' }
];

module.exports = {
  cars,
  avatarConfig,
  recommendationReasons,
  dummyDeals,
  starterCars
}; 