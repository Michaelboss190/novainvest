import type { Commodity } from '@/types';

export const commodities: Commodity[] = [
  // Crypto - Major
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 87432.56,
    change24h: 3.24,
    type: 'crypto',
    icon: '₿',
    description: 'The world\'s first decentralized cryptocurrency'
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 2234.78,
    change24h: -1.45,
    type: 'crypto',
    icon: 'Ξ',
    description: 'Smart contract platform and decentralized applications'
  },
  {
    id: '9',
    name: 'Solana',
    symbol: 'SOL',
    price: 145.23,
    change24h: 7.89,
    type: 'crypto',
    icon: '◎',
    description: 'High-performance blockchain platform'
  },
  {
    id: '10',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.89,
    change24h: -0.45,
    type: 'crypto',
    icon: '₳',
    description: 'Proof-of-stake blockchain platform'
  },
  {
    id: '13',
    name: 'Ripple',
    symbol: 'XRP',
    price: 2.45,
    change24h: 1.23,
    type: 'crypto',
    icon: '✕',
    description: 'Digital payment protocol for financial transactions'
  },
  {
    id: '14',
    name: 'Polkadot',
    symbol: 'DOT',
    price: 6.78,
    change24h: -2.34,
    type: 'crypto',
    icon: '●',
    description: 'Multi-chain interoperability protocol'
  },
  {
    id: '15',
    name: 'Chainlink',
    symbol: 'LINK',
    price: 18.92,
    change24h: 4.56,
    type: 'crypto',
    icon: '◈',
    description: 'Decentralized oracle network'
  },
  {
    id: '16',
    name: 'Avalanche',
    symbol: 'AVAX',
    price: 38.45,
    change24h: 5.67,
    type: 'crypto',
    icon: '▲',
    description: 'High-throughput smart contract platform'
  },

  // Metals
  {
    id: '3',
    name: 'Gold',
    symbol: 'XAU',
    price: 2894.32,
    change24h: 0.67,
    type: 'metal',
    icon: '🥇',
    description: 'Precious metal and traditional safe-haven asset'
  },
  {
    id: '4',
    name: 'Silver',
    symbol: 'XAG',
    price: 32.45,
    change24h: 1.23,
    type: 'metal',
    icon: '🥈',
    description: 'Industrial and investment precious metal'
  },
  {
    id: '11',
    name: 'Platinum',
    symbol: 'XPT',
    price: 978.45,
    change24h: 0.34,
    type: 'metal',
    icon: '⚪',
    description: 'Rare precious metal with industrial uses'
  },
  {
    id: '17',
    name: 'Palladium',
    symbol: 'XPD',
    price: 1023.67,
    change24h: -0.89,
    type: 'metal',
    icon: '◉',
    description: 'Rare metal used in catalytic converters'
  },
  {
    id: '18',
    name: 'Copper',
    symbol: 'HG',
    price: 4.23,
    change24h: 1.45,
    type: 'metal',
    icon: '🟤',
    description: 'Industrial metal essential for construction'
  },

  // Energy
  {
    id: '5',
    name: 'Crude Oil',
    symbol: 'WTI',
    price: 78.92,
    change24h: -2.15,
    type: 'energy',
    icon: '🛢️',
    description: 'West Texas Intermediate crude oil futures'
  },
  {
    id: '6',
    name: 'Natural Gas',
    symbol: 'NG',
    price: 3.45,
    change24h: 4.56,
    type: 'energy',
    icon: '🔥',
    description: 'Natural gas futures for energy trading'
  },
  {
    id: '19',
    name: 'Brent Oil',
    symbol: 'BRENT',
    price: 82.34,
    change24h: -1.78,
    type: 'energy',
    icon: '🛢️',
    description: 'Brent crude oil from the North Sea'
  },
  {
    id: '20',
    name: 'Gasoline',
    symbol: 'RBOB',
    price: 2.34,
    change24h: 1.23,
    type: 'energy',
    icon: '⛽',
    description: 'Reformulated gasoline blendstock'
  },
  {
    id: '21',
    name: 'Heating Oil',
    symbol: 'HO',
    price: 2.56,
    change24h: -0.45,
    type: 'energy',
    icon: '🏭',
    description: 'Fuel oil for heating purposes'
  },

  // Stocks - Tech
  {
    id: '7',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    price: 245.67,
    change24h: 1.89,
    type: 'stock',
    icon: '🍎',
    description: 'Technology company - consumer electronics'
  },
  {
    id: '8',
    name: 'Tesla Inc.',
    symbol: 'TSLA',
    price: 178.34,
    change24h: -3.21,
    type: 'stock',
    icon: '🚗',
    description: 'Electric vehicles and clean energy company'
  },
  {
    id: '12',
    name: 'NVIDIA',
    symbol: 'NVDA',
    price: 892.45,
    change24h: 5.67,
    type: 'stock',
    icon: '🎮',
    description: 'AI and graphics processing technology leader'
  },
  {
    id: '22',
    name: 'Microsoft',
    symbol: 'MSFT',
    price: 423.78,
    change24h: 2.34,
    type: 'stock',
    icon: '⊞',
    description: 'Software and cloud computing giant'
  },
  {
    id: '23',
    name: 'Amazon',
    symbol: 'AMZN',
    price: 198.45,
    change24h: 1.56,
    type: 'stock',
    icon: '📦',
    description: 'E-commerce and cloud services leader'
  },
  {
    id: '24',
    name: 'Google',
    symbol: 'GOOGL',
    price: 167.89,
    change24h: 0.78,
    type: 'stock',
    icon: '🔍',
    description: 'Search engine and digital advertising'
  },
  {
    id: '25',
    name: 'Meta',
    symbol: 'META',
    price: 512.34,
    change24h: 3.45,
    type: 'stock',
    icon: '👥',
    description: 'Social media and virtual reality'
  },
  {
    id: '26',
    name: 'Netflix',
    symbol: 'NFLX',
    price: 678.90,
    change24h: -1.23,
    type: 'stock',
    icon: '🎬',
    description: 'Streaming entertainment service'
  },

  // Stocks - Finance
  {
    id: '27',
    name: 'JPMorgan',
    symbol: 'JPM',
    price: 234.56,
    change24h: 0.89,
    type: 'stock',
    icon: '🏦',
    description: 'Global financial services firm'
  },
  {
    id: '28',
    name: 'Berkshire',
    symbol: 'BRK',
    price: 456.78,
    change24h: 1.12,
    type: 'stock',
    icon: '💰',
    description: 'Warren Buffett\'s investment conglomerate'
  },

  // Stocks - Healthcare
  {
    id: '29',
    name: 'Johnson & Johnson',
    symbol: 'JNJ',
    price: 156.78,
    change24h: -0.34,
    type: 'stock',
    icon: '💊',
    description: 'Pharmaceuticals and medical devices'
  },
  {
    id: '30',
    name: 'Pfizer',
    symbol: 'PFE',
    price: 28.45,
    change24h: 0.67,
    type: 'stock',
    icon: '💉',
    description: 'Pharmaceutical research and development'
  },

  // Forex
  {
    id: '31',
    name: 'EUR/USD',
    symbol: 'EURUSD',
    price: 1.08,
    change24h: 0.23,
    type: 'forex',
    icon: '💶',
    description: 'Euro to US Dollar exchange rate'
  },
  {
    id: '32',
    name: 'GBP/USD',
    symbol: 'GBPUSD',
    price: 1.26,
    change24h: -0.15,
    type: 'forex',
    icon: '💷',
    description: 'British Pound to US Dollar'
  },
  {
    id: '33',
    name: 'USD/JPY',
    symbol: 'USDJPY',
    price: 149.23,
    change24h: 0.45,
    type: 'forex',
    icon: '💴',
    description: 'US Dollar to Japanese Yen'
  },
  {
    id: '34',
    name: 'USD/CHF',
    symbol: 'USDCHF',
    price: 0.89,
    change24h: -0.23,
    type: 'forex',
    icon: '🇨🇭',
    description: 'US Dollar to Swiss Franc'
  },

  // Indices
  {
    id: '35',
    name: 'S&P 500',
    symbol: 'SPX',
    price: 5123.45,
    change24h: 1.23,
    type: 'index',
    icon: '📊',
    description: 'US stock market index of 500 large companies'
  },
  {
    id: '36',
    name: 'NASDAQ',
    symbol: 'IXIC',
    price: 16234.56,
    change24h: 2.45,
    type: 'index',
    icon: '📈',
    description: 'Technology-focused stock market index'
  },
  {
    id: '37',
    name: 'Dow Jones',
    symbol: 'DJI',
    price: 38923.45,
    change24h: 0.89,
    type: 'index',
    icon: '🏭',
    description: '30 large US company stock index'
  }
];

export const getCommodityById = (id: string): Commodity | undefined => {
  return commodities.find(c => c.id === id);
};

export const getCommoditiesByType = (type: Commodity['type']): Commodity[] => {
  return commodities.filter(c => c.type === type);
};
