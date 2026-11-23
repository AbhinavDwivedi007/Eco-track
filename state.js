/**
 * EcoTrack - Centralized Knowledge & Configuration Store
 * Contains predefined EcoTicker items, approved streak milestones (7, 14, 30 days),
 * and educational tip registries.
 */

// Predefined Eco Ticker Facts & Targets (Requirement 8)
const ECO_TICKER_ITEMS = [
  { type: 'fact', badge: '🌱 Eco Fact', text: 'Small daily actions can significantly reduce your carbon footprint over time.' },
  { type: 'target', badge: '💡 Today\'s Target', text: 'Choose a lower-carbon mode of transport for your routine travel today.' },
  { type: 'fact', badge: '🌱 Eco Fact', text: 'Unplugging electronics on phantom standby saves up to 10% on residential electricity.' },
  { type: 'target', badge: '💡 Today\'s Target', text: 'Incorporate a nourishing plant-rich lunch or dinner into your day.' },
  { type: 'fact', badge: '🌱 Eco Fact', text: 'Walking or cycling for trips under 3 km generates zero tailpipe carbon emissions.' },
  { type: 'target', badge: '💡 Today\'s Target', text: 'Carry a reusable flask to eliminate single-use beverage containers.' }
];

// Approved Streak Reward Milestones (Requirement 5)
const REWARD_MILESTONES = [
  {
    id: 'starter',
    name: 'Eco Starter',
    daysRequired: 7,
    icon: 'fa-seedling',
    emoji: '🌱',
    description: 'Complete 7 consecutive days of carbon footprint tracking.'
  },
  {
    id: 'saver',
    name: 'Eco Saver',
    daysRequired: 14,
    icon: 'fa-shield-halved',
    emoji: '🌿',
    description: 'Maintain a 14-day streak of mindful environmental tracking.'
  },
  {
    id: 'champion',
    name: 'Green Champion',
    daysRequired: 30,
    icon: 'fa-trophy',
    emoji: '🏆',
    description: 'Reach 30 consecutive tracking days. The pinnacle of sustainable consistency.'
  }
];

// Targeted Personalized Tips (Mapped to User's Highest-Emission Category - Requirement 3)
const PERSONALIZED_TIPS_DATABASE = {
  transport: [
    {
      icon: 'fa-bus',
      title: 'Shift Commute to Metro or Bus',
      impact: 'High Impact',
      desc: 'Transportation is your highest contributor. Commuting via public transit reduces passenger emissions by over 65% compared to solo driving.'
    },
    {
      icon: 'fa-person-walking',
      title: 'Active Mobility for Short Trips (< 3 km)',
      impact: 'Quick Win',
      desc: 'Replace short motorized errand trips with walking or cycling. Eliminates tailpipe emissions entirely and improves daily wellness.'
    },
    {
      icon: 'fa-users',
      title: 'Organize Daily Carpools',
      impact: 'Medium Impact',
      desc: 'Sharing rides with 1 or 2 colleagues immediately halves fuel consumption and vehicle carbon output for your household.'
    }
  ],
  electricity: [
    {
      icon: 'fa-plug-circle-xmark',
      title: 'Switch Off Standby Phantom Power',
      impact: 'High Impact',
      desc: 'Home appliances on standby silently consume up to 10% of monthly electricity. Turn off power strips overnight.'
    },
    {
      icon: 'fa-temperature-arrow-down',
      title: 'Optimize Thermostat & AC',
      impact: 'Easy Win',
      desc: 'Setting cooling to 24°C instead of 20°C reduces compressor electricity demand by 15-20% each billing cycle.'
    },
    {
      icon: 'fa-sun',
      title: 'Adopt Solar / Green Energy Tariff',
      impact: 'High Impact',
      desc: 'Explore rooftop solar or utility green tariffs to slash electric grid carbon intensity by up to 80%.'
    }
  ],
  food: [
    {
      icon: 'fa-seedling',
      title: 'Embrace Plant-Rich Lunches',
      impact: 'High Impact',
      desc: 'Plant proteins (lentils, chickpeas, tofu) require up to 80% less carbon and land than red meats. Try meat-free meals 3 days a week.'
    },
    {
      icon: 'fa-utensils',
      title: 'Zero Food Waste Planning',
      impact: 'Medium Impact',
      desc: 'Plan grocery lists in advance. Decomposing food waste in landfills generates potent methane greenhouse gas.'
    },
    {
      icon: 'fa-apple-whole',
      title: 'Prioritize Local & Seasonal Produce',
      impact: 'Quick Win',
      desc: 'Locally grown seasonal foods avoid extensive long-distance freight, cold-storage, and refrigeration emissions.'
    }
  ],
  waste: [
    {
      icon: 'fa-bottle-water',
      title: 'Eliminate Single-Use Plastics',
      impact: 'Easy Win',
      desc: 'Carry a reusable stainless steel water bottle and cloth grocery bag everywhere to prevent landfill packaging waste.'
    },
    {
      icon: 'fa-recycle',
      title: 'Dedicated Recycling & Composting',
      impact: 'High Impact',
      desc: 'Separating dry paper and aluminum from organic scraps ensures valuable recyclables avoid incinerators.'
    },
    {
      icon: 'fa-box-open',
      title: 'Choose Minimal Packaging',
      impact: 'Medium Impact',
      desc: 'Buy dry goods in bulk and opt for products with plastic-free, recyclable packaging.'
    }
  ]
};

window.ECO_TICKER_ITEMS = ECO_TICKER_ITEMS;
window.REWARD_MILESTONES = REWARD_MILESTONES;
window.PERSONALIZED_TIPS_DATABASE = PERSONALIZED_TIPS_DATABASE;
