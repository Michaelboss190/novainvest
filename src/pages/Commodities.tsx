import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown, 
  LogOut,
  Search,
  Bitcoin,
  Gem,
  Zap,
  BarChart3,
  ShoppingCart,
  Loader2,
  LayoutDashboard,
  ArrowDownRight,
  ArrowUpRight,
  Globe,
  LineChart
} from 'lucide-react';
import { commodities } from '@/data/commodities';
import type { Commodity } from '@/types';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/ui/Toast';

export default function Commodities() {
  const { user, logout, isAuthenticated, updateBalance } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<Commodity['type'] | 'all'>('all');
  const [investAmounts, setInvestAmounts] = useState<Record<string, string>>({});
  const [loadingCommodityId, setLoadingCommodityId] = useState<string | null>(null);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const filteredCommodities = commodities.filter(commodity => {
    const matchesSearch = commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commodity.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || commodity.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleInvest = async (commodity: Commodity) => {
    if (loadingCommodityId) return;

    const amountStr = investAmounts[commodity.id];
    const amount = parseFloat(amountStr || '0');

    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (amount > (user?.balance || 0)) {
      showToast('Insufficient balance', 'error');
      return;
    }

    setLoadingCommodityId(commodity.id);

    try {
      const quantity = amount / commodity.price;

      await supabase.addInvestment({
        user_id: user!.id,
        commodity_id: commodity.id,
        commodity_name: commodity.name,
        amount: amount,
        quantity: quantity,
        purchase_price: commodity.price,
        current_value: amount,
        profit: 0
      });

      await supabase.addTransaction({
        user_id: user!.id,
        type: 'investment',
        amount: amount,
        status: 'completed',
        description: `Purchased ${commodity.name}`
      });

      await updateBalance(-amount);
      setInvestAmounts(prev => ({ ...prev, [commodity.id]: '' }));
      showToast(`Successfully invested $${amount.toLocaleString()} in ${commodity.name}!`, 'success');
    } catch (err) {
      showToast('Failed to process investment. Please try again.', 'error');
    } finally {
      setLoadingCommodityId(null);
    }
  };

  const handleAmountChange = (commodityId: string, value: string) => {
    setInvestAmounts(prev => ({ ...prev, [commodityId]: value }));
  };

  const getTypeIcon = (type: Commodity['type']) => {
    switch (type) {
      case 'crypto': return <Bitcoin className="h-4 w-4" />;
      case 'metal': return <Gem className="h-4 w-4" />;
      case 'energy': return <Zap className="h-4 w-4" />;
      case 'stock': return <BarChart3 className="h-4 w-4" />;
      case 'forex': return <Globe className="h-4 w-4" />;
      case 'index': return <LineChart className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Commodity['type']) => {
    switch (type) {
      case 'crypto': return 'text-orange-400 bg-orange-400/10';
      case 'metal': return 'text-yellow-400 bg-yellow-400/10';
      case 'energy': return 'text-red-400 bg-red-400/10';
      case 'stock': return 'text-blue-400 bg-blue-400/10';
      case 'forex': return 'text-purple-400 bg-purple-400/10';
      case 'index': return 'text-green-400 bg-green-400/10';
    }
  };

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
              className="text-white bg-slate-700/50 h-11 w-11 rounded-xl"
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Investment Opportunities</h2>
          <p className="text-slate-400">Explore and invest in various commodities, cryptocurrencies, and stocks</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search commodities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'crypto', 'metal', 'energy', 'stock', 'forex', 'index'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                onClick={() => setFilterType(type as any)}
                className={filterType === type 
                  ? type === 'crypto' ? 'bg-orange-600' 
                  : type === 'metal' ? 'bg-yellow-600'
                  : type === 'energy' ? 'bg-red-600'
                  : type === 'stock' ? 'bg-blue-600'
                  : type === 'forex' ? 'bg-purple-600'
                  : type === 'index' ? 'bg-green-600'
                  : 'bg-blue-600'
                  : 'border-slate-600 text-slate-300'}
              >
                {type === 'all' ? 'All' : getTypeIcon(type as Commodity['type'])}
                {type !== 'all' && <span className="ml-1 capitalize">{type}</span>}
              </Button>
            ))}
          </div>
        </div>

        {/* Commodities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommodities.map((commodity) => (
            <Card key={commodity.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{commodity.icon}</span>
                    <div>
                      <CardTitle className="text-white text-lg">{commodity.name}</CardTitle>
                      <p className="text-sm text-slate-400">{commodity.symbol}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(commodity.type)}`}>
                    {getTypeIcon(commodity.type)}
                    {commodity.type}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-white">${commodity.price.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {commodity.change24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={commodity.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {commodity.change24h >= 0 ? '+' : ''}{commodity.change24h}% (24h)
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">{commodity.description}</p>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount (USD)"
                      value={investAmounts[commodity.id] || ''}
                      onChange={(e) => handleAmountChange(commodity.id, e.target.value)}
                      disabled={loadingCommodityId === commodity.id}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 flex-1"
                    />
                    <Button
                      onClick={() => handleInvest(commodity)}
                      disabled={!investAmounts[commodity.id] || loadingCommodityId === commodity.id}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {loadingCommodityId === commodity.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Invest
                        </>
                      )}
                    </Button>
                  </div>
                  {investAmounts[commodity.id] && (
                    <p className="text-xs text-slate-400">
                      You will receive: {(parseFloat(investAmounts[commodity.id]) / commodity.price).toFixed(6)} {commodity.symbol}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCommodities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No commodities found matching your search</p>
          </div>
        )}
      </main>
    </div>
  );
}
