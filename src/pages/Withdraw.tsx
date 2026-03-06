import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  LogOut,
  Bitcoin,
  AlertCircle,
  Wallet,
  ArrowUpRight,
  Loader2,
  LayoutDashboard,
  ShoppingCart,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/ui/Toast';

export default function Withdraw() {
  const { user, logout, isAuthenticated, updateBalance } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (dataLoaded || !user) return;
    
    const loadTransactions = async () => {
      const txs = await supabase.getTransactions(user.id);
      setTransactions(txs);
      setDataLoaded(true);
    };
    loadTransactions();
  }, [user?.id, dataLoaded]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const handleWithdraw = async () => {
    if (isLoading) return;

    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (withdrawAmount < 50) {
      showToast('Minimum withdrawal amount is $50', 'error');
      return;
    }

    if (withdrawAmount > (user?.balance || 0)) {
      showToast('Insufficient balance', 'error');
      return;
    }

    if (!btcAddress.trim()) {
      showToast('Please enter a Bitcoin address', 'error');
      return;
    }

    if (!btcAddress.startsWith('bc1') && !btcAddress.startsWith('1') && !btcAddress.startsWith('3')) {
      showToast('Please enter a valid Bitcoin address', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await supabase.addTransaction({
        user_id: user!.id,
        type: 'withdrawal',
        amount: withdrawAmount,
        status: 'pending',
        description: 'Bitcoin Withdrawal',
        btc_address: btcAddress
      });

      await updateBalance(-withdrawAmount);

      const txs = await supabase.getTransactions(user!.id);
      setTransactions(txs);

      showToast(`Withdrawal of $${withdrawAmount.toLocaleString()} submitted! Funds will be sent within 24 hours.`, 'success');
      setAmount('');
      setBtcAddress('');
    } catch (err) {
      showToast('Failed to process withdrawal. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const maxWithdrawal = (user?.balance || 0) - 5;
  const withdrawals = transactions.filter((t: any) => t.type === 'withdrawal');

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
                <p className="text-xs text-slate-400">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-400">Available Balance</p>
                <p className="text-lg font-bold text-white">${user?.balance.toLocaleString()}</p>
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

      {/* Icon Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 py-3 justify-center sm:justify-start">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-11 w-11 rounded-xl"
              onClick={() => navigate('/dashboard')}
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
              className="text-white bg-slate-700/50 h-11 w-11 rounded-xl"
              title="Withdraw"
            >
              <ArrowUpRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Withdraw Funds</h2>
          <p className="text-slate-400">Withdraw your funds to your Bitcoin wallet</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-red-400" />
                Withdrawal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-300">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter withdrawal amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Minimum: $50</span>
                  <button 
                    onClick={() => setAmount(maxWithdrawal > 0 ? maxWithdrawal.toString() : '0')}
                    className="text-blue-400 hover:text-blue-300"
                    disabled={isLoading}
                  >
                    Max: ${maxWithdrawal > 0 ? maxWithdrawal.toLocaleString() : '0'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="btcAddress" className="text-slate-300">Bitcoin Address</Label>
                <Input
                  id="btcAddress"
                  type="text"
                  placeholder="Enter your BTC address (bc1..., 1..., or 3...)"
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 font-mono"
                />
                <p className="text-xs text-slate-500">Double-check your address - transactions cannot be reversed</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">Withdrawal Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-white">${amount ? parseFloat(amount).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network Fee:</span>
                    <span className="text-white">$5.00</span>
                  </div>
                  <div className="border-t border-slate-600 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">You Receive:</span>
                      <span className="text-white font-medium">
                        ${amount ? Math.max(0, parseFloat(amount) - 5).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={!amount || !btcAddress || isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Bitcoin className="h-4 w-4 mr-2" />
                    Withdraw Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-400" />
                  Withdrawal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-blue-400">1</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Processing Time</p>
                      <p className="text-sm text-slate-400">Withdrawals are processed within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-blue-400">2</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Network Fees</p>
                      <p className="text-sm text-slate-400">$5 network fee applies to all withdrawals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-blue-400">3</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Security</p>
                      <p className="text-sm text-slate-400">All withdrawals are manually reviewed for security</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-yellow-900/30 border border-yellow-800">
                  <p className="text-yellow-300 text-sm">
                    Please ensure your Bitcoin address is correct. We cannot recover funds sent to incorrect addresses.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            {!dataLoaded ? (
              <p className="text-center text-slate-400 py-4">Loading...</p>
            ) : withdrawals.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No withdrawal history yet</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.slice(0, 5).map((withdrawal: any) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <ArrowUpRight className="h-4 w-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Bitcoin Withdrawal</p>
                        <p className="text-xs text-slate-400">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-400">
                        -${withdrawal.amount.toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        withdrawal.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
