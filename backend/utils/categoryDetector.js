const CATEGORY_KEYWORDS = {
  'Food': [
    'uber eats', 'ubereats', 'eats', 'grubhub', 'doordash', 'postmates', 
    'mcdonalds', 'burger', 'pizza', 'taco bell', 'subway', 'starbucks', 
    'chipotle', 'domino', 'restaurant', 'cafe', 'food', 'diner', 'grill', 
    'kitchen', 'coca cola', 'pepsi', 'amk asu poly marke', 'market', 'grocery', 
    'whole foods', 'trader joe', 'safeway', 'fry', 'albertsons', 'vending',
    'kfc', 'wendys', 'arbys', 'sonic', 'dairy queen', 'panda express',
    'chick fil a', 'in n out', 'five guys', 'panera', 'qdoba', 'moes'
  ],
  'Travel': [
    'uber', 'lyft', 'gas', 'shell', 'exxon', 'bp', 'fuel', 'airline', 
    'hotel', 'motel', 'airport', 'parking', 'toll', 'rent a car', 'hertz', 
    'enterprise', 'avis', 'budget', 'southwest', 'delta', 'american airlines',
    'united', 'spirit', 'frontier', 'jetblue'
  ],
  'Shopping': [
    'walmart', 'target', 'amazon', 'ebay', 'best buy', 'costco',
    'zumiez', 'mall', 'store', 'shop', 'qt ', 'quicktrip', 'convenience',
    '7 eleven', 'circle k', 'chevron', 'walgreens', 'cvs',
    'dollar tree', 'dollar general', 'family dollar', 'tj maxx', 'marshalls',
    'ross', 'kohls', 'macys', 'nordstrom', 'gap', 'old navy'
  ],
  'Bills': [
    'tmobile', 'verizon', 'at&t', 'sprint', 'electric', 'water', 'gas bill',
    'internet', 'wifi', 'comcast', 'cox', 'spectrum', 'utilities',
    'aps', 'srp', 'sw gas', 'waste management', 'trash'
  ],
  'Entertainment': [
    'netflix', 'hulu', 'disney', 'spotify', 'amazon prime', 'youtube',
    'movie', 'theater', 'concert', 'game', 'xbox', 'playstation', 'riot',
    'ea ', 'steam', 'electronic art', 'twitch', 'HBO', 'apple music',
    'paramount', 'peacock', 'max', 'crunchyroll'
  ],
  'Healthcare': [
    'pharmacy', 'walgreens rx', 'cvs pharmacy', 'doctor', 'hospital', 'clinic',
    'medical', 'health', 'dental', 'dentist', 'vision', 'urgent care',
    'banner health', 'dignityhealth', 'mayo clinic'
  ],
  'Education': [
    'asu', 'arizona state', 'university', 'college', 'school', 'tuition',
    'textbook', 'course', 'pearson', 'cengage', 'mcgraw hill', 'chegg',
    'coursera', 'udemy', 'skillshare'
  ],
  'Transfer': [
    'zelle', 'venmo', 'paypal', 'cash app', 'transfer', 'western union',
    'wu ', 'wuvisaaft', 'wire transfer', 'ach transfer', 'p2p'
  ],
  'ATM': [
    'atm', 'cash withdrawal', 'atm fee', 'surcharge', 'cash advance'
  ],
  'Subscription': [
    'subscription', 'monthly', 'expressvpn', 'vpn', 'openai', 'chatgpt',
    'wmt plus', 'prime membership', 'costco membership', 'gym', 'fitness',
    'planet fitness', 'la fitness', '24 hour fitness'
  ]
};

exports.detectCategory = (description) => {
  if (!description) return 'Other';
  
  const lowerDesc = description.toLowerCase();
  
  // CRITICAL: Check food-related UBER first (most specific)
  if (lowerDesc.includes('uber') && lowerDesc.includes('eats')) {
    return 'Food';
  }
  
  if (lowerDesc.includes('ubereats')) {
    return 'Food';
  }
  
  // Then check travel UBER (less specific)
  if (lowerDesc.includes('uber') && (lowerDesc.includes('pending') || lowerDesc.includes('ride') || lowerDesc.includes('trip'))) {
    return 'Travel';
  }
  
  // Generic UBER without qualifiers goes to Travel
  if (lowerDesc.includes('uber') && !lowerDesc.includes('eats')) {
    return 'Travel';
  }
  
  // Check if CHEVRON (gas stations are shopping for convenience items)
  if (lowerDesc.includes('chevron')) {
    return 'Shopping';
  }
  
  // General category matching for everything else
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'Other';
};

exports.extractMerchantName = (description) => {
  if (!description) return '';
  
  // Remove common prefixes
  let merchant = description
    .replace(/MERCHANT PURCHASE TERMINAL \d+ /gi, '')
    .replace(/POS PURCHASE TERMINAL \d+ /gi, '')
    .replace(/MERCHANT REFUND TERMINAL \d+ /gi, '')
    .replace(/DEBIT CARD PURCHASE - \d+ /gi, '')
    .split('|')[0]
    .trim();
  
  // Clean up location and extra info
  merchant = merchant.split(/\d{2}-\d{2}-\d{2}/)[0].trim();
  merchant = merchant.split(' SEQ #')[0].trim();
  
  return merchant || description.substring(0, 50);
};

exports.getAllCategories = () => {
  return [...Object.keys(CATEGORY_KEYWORDS), 'Salary', 'Freelance', 'Gifts', 'Other'];
};