export interface Commodity {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  type: 'crypto' | 'metal' | 'energy' | 'stock' | 'forex' | 'index';
  icon: string;
  description: string;
}

export interface Investment {
  id: string;
  commodityId: string;
  commodityName: string;
  amount: number;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  currentValue: number;
  profit: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  description: string;
  btcAddress?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  btcAddress: string;
}
