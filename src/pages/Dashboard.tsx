import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  LogOut,
  Bitcoin,
  BarChart3,
  Timer,
  LayoutDashboard,
  ShoppingCart
} from 'lucide-react';
import { commodities } from '@/data/commodities';
import type { DatabaseTransaction, DatabaseInvestment } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/ui/Toast';

export default function Dashboard() {
  const { user, logout, isAuthenticated, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<DatabaseTransaction[]>([]);
  const [investments, setInvestments] = useState<DatabaseInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load user data from Supabase - only once on mount
  useEffect(() => {
    if (dataLoadedRef.current || !user) return;
    
    const loadUserData = async () => {
      setIsLoading(true);
      
      // Load transactions from Supabase
      const userTransactions = await supabase.getTransactions(user.id);
      
      // For demo users, if no transactions exist, create sample ones
      const isDemoUser = user.id.startsWith('demo_');
      if (isDemoUser && userTransactions.length === 0) {
        // Create sample transactions for demo users
        await supabase.addTransaction({
          user_id: user.id,
          type: 'deposit',
          amount: 50000,
          status: 'completed',
          description: 'Bitcoin Deposit'
        });
        await supabase.addTransaction({
          user_id: user.id,
          type: 'investment',
          amount: 10000,
          status: 'completed',
          description: 'Bitcoin Purchase'
        });
        await supabase.addTransaction({
          user_id: user.id,
          type: 'investment',
          amount: 5000,
          status: 'completed',
          description: 'Gold Investment'
        });
        await supabase.addTransaction({
          user_id: user.id,
          type: 'return',
          amount: 1250,
          status: 'completed',
          description: 'Investment Return'
        });
        
        // Reload transactions
        const updatedTransactions = await supabase.getTransactions(user.id);
        setTransactions(updatedTransactions);
      } else {
        setTransactions(userTransactions);
      }

      // Load investments from Supabase
      const userInvestments = await supabase.getInvestments(user.id);
      
      // For demo users, if no investments exist, create sample ones
      if (isDemoUser && userInvestments.length === 0) {
        await supabase.addInvestment({
          user_id: user.id,
          commodity_id: '1',
          commodity_name: 'Bitcoin',
          amount: 10000,
          quantity: 0.114,
          purchase_price: 87432.56,
          current_value: 11250,
          profit: 1250
        });
        await supabase.addInvestment({
          user_id: user.id,
          commodity_id: '3',
          commodity_name: 'Gold',
          amount: 5000,
          quantity: 1.73,
          purchase_price: 2894.32,
          current_value: 5125,
          profit: 125
        });
        
        // Reload investments
        const updatedInvestments = await supabase.getInvestments(user.id);
        setInvestments(updatedInvestments);
      } else {
        setInvestments(userInvestments);
      }
      
      // Initialize live prices
      const initialPrices: Record<string, number> = {};
      userInvestments.forEach(inv => {
        const commodity = commodities.find(c => c.id === inv.commodity_id);
        if (commodity) {
          initialPrices[inv.commodity_id] = commodity.price;
        }
      });
      setLivePrices(initialPrices);
      
      setIsLoading(false);
      dataLoadedRef.current = true;
    };

    loadUserData();
  }, [user?.id]); // Only depend on user.id, not the whole user object

  // Update only live prices every minute - no UI flashing
  useEffect(() => {
    if (investments.length === 0) return;

    const updateLivePrices = () => {
      const newPrices: Record<string, number> = { ...livePrices };
      
      investments.forEach(inv => {
        const commodity = commodities.find(c => c.id === inv.commodity_id);
        if (commodity) {
          // Simulate small price fluctuations for live effect
          const priceFluctuation = (Math.random() - 0.5) * 0.002; // ±0.1% fluctuation
          newPrices[inv.commodity_id] = commodity.price * (1 + priceFluctuation);
        }
      });
      
      setLivePrices(newPrices);
      setLastUpdate(new Date());
    };

    // Update immediately on load
    updateLivePrices();

    // Then update every minute (60 seconds) for live market feel
    const interval = setInterval(updateLivePrices, 60 * 1000);

    return () => clearInterval(interval);
  }, [investments.length]);

  // Check for completed deposits - only update balance, not transactions
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUserData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  // Calculate totals with live profit/loss using live prices
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Calculate current value using live prices
  const totalCurrentValue = investments.reduce((sum, inv) => {
    const livePrice = livePrices[inv.commodity_id];
    if (livePrice) {
      return sum + (inv.quantity * livePrice);
    }
    return sum + inv.current_value;
  }, 0);
  
  const totalProfit = totalCurrentValue - totalInvested;
  const totalPendingDeposit = user?.pendingDeposits?.reduce((sum, d) => sum + d.amount, 0) || 0;

  const getTransactionIcon = (type: DatabaseTransaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case 'investment':
        return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'return':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">NovaInvest</h1>
                <p className="text-xs text-slate-400">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-400">Available Balance</p>
                <p className="text-lg font-bold text-white">${user.balance.toLocaleString()}</p>
                {totalPendingDeposit > 0 && (
                  <p className="text-xs text-yellow-400">
                    +${totalPendingDeposit.toLocaleString()} pending
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Icon Navigation - More Spaced Out */}
      <nav className="border-b border-slate-700 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 py-3 justify-center sm:justify-start">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white bg-slate-700/50 h-11 w-11 rounded-xl"
              title="Dashboard"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-11 w-11 rounded-xl"
              onClick={() => navigate('/commodities')}
              title="Commodities"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-11 w-11 rounded-xl"
              onClick={() => navigate('/deposit')}
              title="Deposit"
            >
              <ArrowDownRight className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-11 w-11 rounded-xl"
              onClick={() => navigate('/withdraw')}
              title="Withdraw"
            >
              <ArrowUpRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Deposits Alert */}
        {user.pendingDeposits && user.pendingDeposits.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-900/30 border border-yellow-800 flex items-center gap-3">
            <Timer className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-300 text-sm">
              You have {user.pendingDeposits.length} pending deposit(s) totaling ${totalPendingDeposit.toLocaleString()}. 
              Funds will be credited to your balance shortly.
            </p>
          </div>
        )}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Available Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${user.balance.toLocaleString()}
              </div>
              {totalPendingDeposit > 0 ? (
                <p className="text-xs text-yellow-400 mt-1">
                  +${totalPendingDeposit.toLocaleString()} pending deposit
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">Ready to invest</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Invested
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${totalInvested.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Across {investments.length} assets</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Current Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${totalCurrentValue.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Live market value</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Profit/Loss
              </CardTitle>
              {totalProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : '0.00'}% return
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate('/deposit')}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
                >
                  <ArrowDownRight className="h-6 w-6" />
                  <span>Deposit</span>
                </Button>
                <Button
                  onClick={() => navigate('/withdraw')}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                >
                  <ArrowUpRight className="h-6 w-6" />
                  <span>Withdraw</span>
                </Button>
                <Button
                  onClick={() => navigate('/commodities')}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Invest</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Bitcoin className="h-6 w-6" />
                  <span>My BTC Address</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions - Static, no refresh */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-slate-400 py-4">Loading...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-slate-400 py-4">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 4).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white capitalize">
                            {transaction.type}
                          </p>
                          <p className="text-xs text-slate-400">{transaction.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          transaction.type === 'withdrawal' || transaction.type === 'investment'
                            ? 'text-red-400'
                            : 'text-green-400'
                        }`}>
                          {transaction.type === 'withdrawal' || transaction.type === 'investment' ? '-' : '+'}
                          ${transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Investments - Numbers update, UI stays static */}
        <Card className="mt-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>My Investments</span>
              <span className="text-xs text-slate-400 font-normal">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-slate-400 py-4">Loading...</p>
            ) : investments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investments.map((investment) => {
                  const commodity = commodities.find(c => c.id === investment.commodity_id);
                  const currentPrice = livePrices[investment.commodity_id] || commodity?.price || investment.purchase_price;
                  const currentValue = investment.quantity * currentPrice;
                  const profit = currentValue - investment.amount;
                  const profitPercent = (profit / investment.amount) * 100;
                  
                  return (
                    <div
                      key={investment.id}
                      className="p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {commodity?.icon || '📈'}
                          </span>
                          <span className="font-medium text-white">{investment.commodity_name}</span>
                        </div>
                        <span className={`text-sm font-medium ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {profit >= 0 ? '+' : ''}${profit.toLocaleString()} ({profitPercent.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Invested</p>
                          <p className="text-white font-medium">${investment.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Current Value</p>
                          <p className="text-white font-medium">${currentValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Quantity</p>
                          <p className="text-white font-medium">{investment.quantity.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Current Price</p>
                          <p className="text-white font-medium">${currentPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4">You haven't made any investments yet</p>
                <Button 
                  onClick={() => navigate('/commodities')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Start Investing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Overview */}
        <Card className="mt-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {commodities.slice(0, 4).map((commodity) => (
                <div
                  key={commodity.id}
                  className="p-4 rounded-lg bg-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => navigate('/commodities')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{commodity.icon}</span>
                    <span className="font-medium text-white">{commodity.symbol}</span>
                  </div>
                  <p className="text-lg font-bold text-white">${commodity.price.toLocaleString()}</p>
                  <p className={`text-sm ${commodity.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {commodity.change24h >= 0 ? '+' : ''}{commodity.change24h}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
