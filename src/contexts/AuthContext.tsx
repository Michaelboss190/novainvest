import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, dbUserToAppUser, type DatabaseUser, type DatabasePendingDeposit } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  btcAddress: string;
  pendingDeposits: PendingDeposit[];
}

export interface PendingDeposit {
  id: string;
  amount: number;
  createdAt: number;
  status: 'pending' | 'completed';
}

// Helper to convert database pending deposit to app format
const dbPendingToApp = (d: DatabasePendingDeposit): PendingDeposit => ({
  id: d.id,
  amount: d.amount,
  createdAt: new Date(d.created_at).getTime(),
  status: d.status
});

interface SignupResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<SignupResult>;
  logout: () => void;
  isAuthenticated: boolean;
  updateBalance: (amount: number) => Promise<void>;
  addPendingDeposit: (amount: number) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      // Get current session
      const { data: { session } } = await supabase['client'].auth.getSession();
      
      if (session?.user) {
        const dbUser = await supabase.getUserById(session.user.id);
        if (dbUser) {
          const pendingDeposits = await supabase.getPendingDeposits(dbUser.id);
          setUser({
            ...dbUserToAppUser(dbUser),
            pendingDeposits: pendingDeposits.map(dbPendingToApp)
          });
        }
      }
      setIsLoading(false);
    };
    
    checkSession();

    // Listen for auth changes
    const unsubscribe = supabase.onAuthChange((dbUser: DatabaseUser | null) => {
      if (dbUser) {
        supabase.getPendingDeposits(dbUser.id).then((pendingDeposits: DatabasePendingDeposit[]) => {
          setUser({
            ...dbUserToAppUser(dbUser),
            pendingDeposits: pendingDeposits.map(dbPendingToApp)
          });
        });
      } else {
        setUser(null);
      }
    });

    // Start deposit processor
    const depositInterval = setInterval(() => {
      supabase.processPendingDeposits();
      if (user) {
        refreshUserData();
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(depositInterval);
    };
  }, []);

  const refreshUserData = async () => {
    if (user) {
      const dbUser = await supabase.getUserById(user.id);
      if (dbUser) {
        const pendingDeposits = await supabase.getPendingDeposits(dbUser.id);
        setUser({
          ...dbUserToAppUser(dbUser),
          pendingDeposits: pendingDeposits.map(dbPendingToApp)
        });
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { user: dbUser, error } = await supabase.signIn(email, password);
    
    if (error || !dbUser) {
      return false;
    }

    // Get pending deposits
    const pendingDeposits = await supabase.getPendingDeposits(dbUser.id);
    
    const appUser: User = {
      ...dbUserToAppUser(dbUser),
      pendingDeposits: pendingDeposits.map(dbPendingToApp)
    };

    setUser(appUser);
    return true;
  };

  const signup = async (name: string, email: string, password: string): Promise<SignupResult> => {
    const { user: dbUser, error } = await supabase.signUp(email, password, name);
    
    if (error) {
      return { success: false, error: error.message };
    }

    if (!dbUser) {
      return { success: false, error: 'Failed to create account. Please try again.' };
    }

    const appUser: User = {
      ...dbUserToAppUser(dbUser),
      pendingDeposits: []
    };

    setUser(appUser);
    return { success: true };
  };

  const logout = async () => {
    await supabase.signOut();
    setUser(null);
  };

  const updateBalance = async (amount: number) => {
    if (user) {
      const newBalance = user.balance + amount;
      await supabase.updateUserBalance(user.id, newBalance);
      setUser({ ...user, balance: newBalance });
    }
  };

  const addPendingDeposit = async (amount: number) => {
    if (user) {
      await supabase.addPendingDeposit(user.id, amount);
      const pendingDeposits = await supabase.getPendingDeposits(user.id);
      setUser({
        ...user,
        pendingDeposits: pendingDeposits.map(dbPendingToApp)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        updateBalance,
        addPendingDeposit,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
