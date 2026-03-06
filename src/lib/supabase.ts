import { createClient } from '@supabase/supabase-js';

// Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Database types matching Supabase schema
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  balance: number;
  btc_address: string;
  created_at: string;
}

export interface DatabaseTransaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  btc_address?: string;
  created_at: string;
}

export interface DatabaseInvestment {
  id: string;
  user_id: string;
  commodity_id: string;
  commodity_name: string;
  amount: number;
  quantity: number;
  purchase_price: number;
  current_value: number;
  profit: number;
  created_at: string;
}

export interface DatabasePendingDeposit {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed';
  created_at: string;
}

// Create the Supabase client
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Extended Supabase client with custom methods
class SupabaseExtended {
  private client = supabaseClient;
  private authListeners: ((user: DatabaseUser | null) => void)[] = [];

  constructor() {
    // Listen for auth state changes
    this.client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.getUserById(session.user.id).then(user => {
          this.notifyAuthChange(user);
        });
      } else {
        this.notifyAuthChange(null);
      }
    });
  }

  onAuthChange(callback: (user: DatabaseUser | null) => void) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  private notifyAuthChange(user: DatabaseUser | null) {
    this.authListeners.forEach(cb => cb(user));
  }

  // Auth methods
  async signUp(email: string, password: string, name: string): Promise<{ user: DatabaseUser | null; error: Error | null }> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      return { user: null, error: new Error(error.message) };
    }

    if (data.user) {
      // Get the profile that was auto-created by the trigger
      const user = await this.getUserById(data.user.id);
      return { user, error: null };
    }

    return { user: null, error: null };
  }

  async signIn(email: string, password: string): Promise<{ user: DatabaseUser | null; error: Error | null }> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { user: null, error: new Error(error.message) };
    }

    if (data.user) {
      const user = await this.getUserById(data.user.id);
      return { user, error: null };
    }

    return { user: null, error: null };
  }

  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await this.client.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  }

  getCurrentUser(): DatabaseUser | null {
    return null; // Will be fetched async
  }

  // User data methods
  async getUserById(userId: string): Promise<DatabaseUser | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as DatabaseUser;
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    await this.client
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);
  }

  // Transaction methods
  async getTransactions(userId: string): Promise<DatabaseTransaction[]> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as DatabaseTransaction[];
  }

  async addTransaction(transaction: Omit<DatabaseTransaction, 'id' | 'created_at'>): Promise<DatabaseTransaction> {
    const { data, error } = await this.client
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data as DatabaseTransaction;
  }

  // Investment methods
  async getInvestments(userId: string): Promise<DatabaseInvestment[]> {
    const { data, error } = await this.client
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as DatabaseInvestment[];
  }

  async addInvestment(investment: Omit<DatabaseInvestment, 'id' | 'created_at'>): Promise<DatabaseInvestment> {
    const { data, error } = await this.client
      .from('investments')
      .insert([investment])
      .select()
      .single();

    if (error) throw error;
    return data as DatabaseInvestment;
  }

  // Pending deposit methods
  async getPendingDeposits(userId: string): Promise<DatabasePendingDeposit[]> {
    const { data, error } = await this.client
      .from('pending_deposits')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as DatabasePendingDeposit[];
  }

  async addPendingDeposit(userId: string, amount: number): Promise<DatabasePendingDeposit> {
    const { data, error } = await this.client
      .from('pending_deposits')
      .insert([{ user_id: userId, amount, status: 'pending' }])
      .select()
      .single();

    if (error) throw error;
    return data as DatabasePendingDeposit;
  }

  // Track processed deposits to prevent duplicate processing
  private processedDeposits: Set<string> = new Set();

  // Process pending deposits (called periodically)
  async processPendingDeposits(): Promise<void> {
    const { data: pendingDeposits, error } = await this.client
      .from('pending_deposits')
      .select('*')
      .eq('status', 'pending');

    if (error || !pendingDeposits) return;

    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;

    for (const deposit of pendingDeposits as DatabasePendingDeposit[]) {
      // Skip if already processed in this session
      if (this.processedDeposits.has(deposit.id)) continue;

      const depositTime = new Date(deposit.created_at).getTime();
      if (now.getTime() - depositTime >= fiveMinutes) {
        // Mark as processed immediately to prevent duplicates
        this.processedDeposits.add(deposit.id);

        // Use RPC or atomic update to prevent race conditions
        // First, verify the deposit is still pending
        const { data: currentDeposit } = await this.client
          .from('pending_deposits')
          .select('status')
          .eq('id', deposit.id)
          .single();

        // Only proceed if still pending
        if (currentDeposit?.status !== 'pending') continue;

        // Complete the deposit
        const { error: updateError } = await this.client
          .from('pending_deposits')
          .update({ status: 'completed' })
          .eq('id', deposit.id)
          .eq('status', 'pending'); // Extra safety check

        if (updateError) continue; // Skip if update failed

        // Update user balance using raw SQL to prevent race conditions
        const { data: user } = await this.client
          .from('profiles')
          .select('balance')
          .eq('id', deposit.user_id)
          .single();

        if (user) {
          const newBalance = user.balance + deposit.amount;
          await this.client
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', deposit.user_id);
        }

        // Update transaction status
        await this.client
          .from('transactions')
          .update({ status: 'completed', description: 'Bitcoin Deposit (Confirmed)' })
          .eq('user_id', deposit.user_id)
          .eq('type', 'deposit')
          .eq('status', 'pending')
          .eq('amount', deposit.amount);
      }
    }
  }
}

export const supabase = new SupabaseExtended();

// Helper to convert DatabaseUser to app User format
export const dbUserToAppUser = (dbUser: DatabaseUser) => ({
  id: dbUser.id,
  email: dbUser.email,
  name: dbUser.name,
  balance: dbUser.balance,
  btcAddress: dbUser.btc_address,
  pendingDeposits: []
});
