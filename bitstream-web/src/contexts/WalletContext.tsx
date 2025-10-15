/**
 * Wallet Context Provider
 * Manages wallet state and operations across the app using Turnkey
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getUserData,
  saveUserData,
  clearUserData,
  UserAuth,
} from '@/lib/turnkey';
import { useWalletBalance, useSendPayment, useRefreshBalance } from '@/hooks/useWalletQueries';
import { useTurnkeyWallet } from '@/hooks/useTurnkeyWallet';

interface WalletContextType {
  // State
  user: UserAuth | null;
  balance: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Wallet operations
  createUserWallet: (email: string, username: string, walletAddress?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  refreshBalance: () => Promise<void>;

  // Transaction operations
  sendPaymentTransaction: (toAddress: string, amount: number) => Promise<any>;

  // Auth operations
  signIn: (opts: { email?: string; walletAddress?: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;

  // Error handling
  clearError: () => void;

  // Internal methods for TurnkeyWalletCreator
  setUser: (user: UserAuth) => void;
  saveUserData: (user: UserAuth) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get Turnkey wallet data
  const { httpClient, publicKey, ethAddress, address: turnkeyAddress } = useTurnkeyWallet();

  // Use React Query for balance management
  const {
    data: balance = 0,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useWalletBalance(user?.walletAddress);

  // Use React Query mutation for payments
  const sendPaymentMutation = useSendPayment();
  const refreshBalanceQuery = useRefreshBalance();

  // Load user data on mount
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      console.log('✅ User data loaded from storage');
    }
  }, []);

  // Sync Turnkey address with user data
  useEffect(() => {
    if (user && turnkeyAddress && (user.walletAddress === 'PENDING_WALLET_CREATION' || user.walletAddress === 'PENDING_CONNECTION')) {
      console.log('🔄 Syncing Turnkey address with user data:', turnkeyAddress);
      const updatedUser = { ...user, walletAddress: turnkeyAddress };
      setUser(updatedUser);
      saveUserData(updatedUser);
    }
  }, [turnkeyAddress, user]);

  // Handle balance errors
  useEffect(() => {
    if (balanceError) {
      setError('Failed to load balance');
      console.error('Balance error:', balanceError);
    }
  }, [balanceError]);

  const isLoading = isBalanceLoading || sendPaymentMutation.isPending;

  // Sign in using stored wallet data
  const signIn = async (
    opts: { email?: string; walletAddress?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      const userData = getUserData();
      if (userData) {
        setUser(userData);
        console.log('✅ User authenticated');
        return { success: true };
      } else {
        const msg = 'No user data found';
        setError(msg);
        return { success: false, error: msg };
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Authentication failed';
      setError(msg);
      console.error('❌ Error during sign in:', e);
      return { success: false, error: msg };
    }
  };

  // Create user wallet - can accept optional wallet address from Turnkey
  const createUserWallet = async (
    email: string,
    username: string,
    walletAddress?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      console.log('🔐 Creating user wallet for:', username);
      
      // If walletAddress provided (from Turnkey), use it. Otherwise mark as pending
      const newUser: UserAuth = {
        userId: `user-${Date.now()}`,
        email,
        username,
        walletAddress: walletAddress || 'PENDING_WALLET_CREATION',
        subOrgId: `sub-${Date.now()}`,
        privateKeyId: `pk-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      saveUserData(newUser);
      setUser(newUser);
      console.log('✅ User saved with wallet:', walletAddress || 'PENDING');
      
      return {
        success: true,
        data: newUser,
      };
    } catch (error) {
      console.error('❌ Wallet creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create wallet',
      };
    }
  };

  // Send payment transaction using React Query mutation
  const sendPaymentTransaction = async (
    toAddress: string,
    amount: number
  ): Promise<any> => {
    try {
      if (!user?.walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!httpClient || !publicKey) {
        throw new Error('Turnkey not initialized. Please connect your wallet.');
      }

      setError(null);

      console.log('💸 Sending payment:', amount, 'sBTC to', toAddress);

      const result = await sendPaymentMutation.mutateAsync({
        fromAddress: user.walletAddress,
        toAddress,
        amount,
        httpClient,
        publicKey,
        ethAddress,
      });

      if (result.success) {
        console.log('✅ Payment successful:', result.txId);
        // Balance will be automatically refreshed by React Query
      } else {
        setError(result.error || 'Transaction failed');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setError(errorMessage);
      console.error('❌ Error sending payment:', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Refresh balance function
  const refreshBalance = async () => {
    if (user?.walletAddress) {
      refreshBalanceQuery(user.walletAddress);
    }
  };

  // Sign out
  const signOut = () => {
    clearUserData();
    setUser(null);
    setError(null);
    console.log('👋 User signed out');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const isAuthenticated = user !== null;

  return (
    <WalletContext.Provider
      value={{
        user,
        balance,
        isLoading,
        isAuthenticated,
        error,
        createUserWallet,
        refreshBalance,
        sendPaymentTransaction,
        signIn,
        signOut,
        clearError,
        setUser,
        saveUserData,
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

