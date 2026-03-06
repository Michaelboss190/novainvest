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
  Copy,
  Check,
  Clock,
  Wallet,
  Timer,
  Loader2,
  LayoutDashboard,
  ShoppingCart,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/ui/Toast';

export default function Deposit() {
  const { user, logout, isAuthenticated, addPendingDeposit, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});
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

  useEffect(() => {
    const interval = setInterval(() => {
      refreshUserData();
      updateCountdowns();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateCountdowns = () => {
    if (user?.pendingDeposits) {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      const newCountdowns: Record<string, number> = {};
      
      user.pendingDeposits.forEach(deposit => {
        if (deposit.status === 'pending') {
          const elapsed = now - deposit.createdAt;
          const remaining = Math.max(0, fiveMinutes - elapsed);
          newCountdowns[deposit.id] = remaining;
        }
      });
      
      setCountdowns(newCountdowns);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const copyToClipboard = () => {
    if (user?.btcAddress) {
      navigator.clipboard.writeText(user.btcAddress);
      setCopied(true);
      showToast('Bitcoin address copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeposit = async () => {
    if (isLoading) return;
    
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (depositAmount < 100) {
      showToast('Minimum deposit amount is $100', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await addPendingDeposit(depositAmount);

      await supabase.addTransaction({
        user_id: user!.id,
        type: 'deposit',
        amount: depositAmount,
        status: 'pending',
        description: 'Bitcoin Deposit (Pending - 5 min)',
        btc_address: user?.btcAddress
      });

      const txs = await supabase.getTransactions(user!.id);
      setTransactions(txs);

      showToast(`Deposit of $${depositAmount.toLocaleString()} initiated! Funds will be credited in 5 minutes.`, 'success');
      setAmount('');
    } catch (err) {
      showToast('Failed to process deposit. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const deposits = transactions.filter((t: any) => t.type === 'deposit');

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
              className="text-white bg-slate-700/50 h-11 w-11 rounded-xl"
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Deposit Funds</h2>
          <p className="text-slate-400">Add funds to your account via Bitcoin</p>
        </div>

        {user?.pendingDeposits && user.pendingDeposits.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-900/30 border border-yellow-800 flex items-center gap-3">
            <Timer className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-300 text-sm">
              You have {user.pendingDeposits.length} pending deposit(s). Funds will be credited after 5 minutes.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-400" />
                Deposit Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-300">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter deposit amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">Minimum deposit: $100</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">Deposit Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-white">${amount ? parseFloat(amount).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network Fee:</span>
                    <span className="text-white">$2.50</span>
                  </div>
                  <div className="border-t border-slate-600 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">Total to Send:</span>
                      <span className="text-white font-medium">
                        ${amount ? (parseFloat(amount) + 2.5).toLocaleString() : '2.50'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-300">
                    Deposits are credited after 5 minutes
                  </span>
                </div>
              </div>

              <Button
                onClick={handleDeposit}
                disabled={!amount || isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Bitcoin className="h-4 w-4 mr-2" />
                    Deposit Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-orange-400" />
                Your Bitcoin Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="inline-block p-4 rounded-xl bg-white mb-4">
                  <div className="w-48 h-48 bg-slate-900 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Bitcoin className="h-16 w-16 text-orange-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">QR Code</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">BTC Address</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={user?.btcAddress || ''}
                    className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-900/30 border border-blue-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <p className="text-blue-300 text-sm">
                    Deposits typically confirm within 5 minutes. Your balance will be updated automatically.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-slate-400">Important:</p>
                <ul className="list-disc list-inside text-slate-500 space-y-1">
                  <li>Only send Bitcoin (BTC) to this address</li>
                  <li>Minimum deposit: $100</li>
                  <li>Deposits are credited after 5 minutes</li>
                  <li>Double-check the address before sending</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {user?.pendingDeposits && user.pendingDeposits.length > 0 && (
          <Card className="mt-8 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Timer className="h-5 w-5 text-yellow-400" />
                Pending Deposits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.pendingDeposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-yellow-900/20 border border-yellow-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Bitcoin Deposit</p>
                        <p className="text-xs text-slate-400">Pending confirmation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        ${deposit.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-yellow-400">
                        {countdowns[deposit.id] > 0 
                          ? `Credited in: ${formatTime(countdowns[deposit.id])}` 
                          : 'Processing...'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Deposit History</CardTitle>
          </CardHeader>
          <CardContent>
            {!dataLoaded ? (
              <p className="text-center text-slate-400 py-4">Loading...</p>
            ) : deposits.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No deposit history yet</p>
            ) : (
              <div className="space-y-3">
                {deposits.slice(0, 5).map((deposit: any) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        deposit.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      }`}>
                        <Bitcoin className={`h-4 w-4 ${
                          deposit.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Bitcoin Deposit</p>
                        <p className="text-xs text-slate-400">
                          {new Date(deposit.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        deposit.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        +${deposit.amount.toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        deposit.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {deposit.status}
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
