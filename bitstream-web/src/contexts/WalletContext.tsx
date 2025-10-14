/**
 * Wallet Context Provider
 * Manages wallet state and operations across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserData, getWalletBalance, UserAuth } from '@/lib/turnkey';

interface WalletContextType {
  user: UserAuth | null;
  balance: number;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      loadBalance(userData.walletAddress);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Load wallet balance
  const loadBalance = async (address: string) => {
    try {
      setIsLoading(true);
      const walletBalance = await getWalletBalance(address);
      setBalance(walletBalance);
    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh balance function
  const refreshBalance = async () => {
    if (user?.walletAddress) {
      await loadBalance(user.walletAddress);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        user,
        balance,
        isLoading,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

