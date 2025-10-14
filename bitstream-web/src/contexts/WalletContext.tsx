/**
 * Wallet Context Provider
 * Manages wallet state and operations across the app using Turnkey
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getUserData,
  createWallet,
  saveUserData,
  clearUserData,
  authenticateUser,
  UserAuth,
  WalletCreationResult,
  TransactionResult,
} from '@/lib/turnkey';
import { useWalletBalance, useSendPayment, useRefreshBalance } from '@/hooks/useWalletQueries';

interface WalletContextType {
  // State
  user: UserAuth | null;
  balance: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Wallet operations
  createUserWallet: (email: string, username: string) => Promise<WalletCreationResult>;
  refreshBalance: () => Promise<void>;

  // Transaction operations
  sendPaymentTransaction: (toAddress: string, amount: number) => Promise<TransactionResult>;

  // Auth operations
  signIn: (opts: { email?: string; walletAddress?: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;

  // Error handling
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Handle balance errors
  useEffect(() => {
    if (balanceError) {
      setError('Failed to load balance');
      console.error('Balance error:', balanceError);
    }
  }, [balanceError]);

  const isLoading = isBalanceLoading || sendPaymentMutation.isPending;

  // Sign in using Turnkey passkey auth
  const signIn = async (
    opts: { email?: string; walletAddress?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      const result = await authenticateUser(opts);
      if (result.success) {
        const userData = getUserData();
        if (userData) {
          setUser(userData);
          console.log('✅ User authenticated via Turnkey');
        }
        return { success: true };
      } else {
        const msg = result.error || 'Authentication failed';
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

  // Create a new wallet for a user
  const createUserWallet = async (
    email: string,
    username: string
  ): Promise<WalletCreationResult> => {
    try {
      setError(null);

      console.log('🔐 Creating wallet for:', username);

      const result = await createWallet(email, username);

      if (result.success && result.data) {
        // Save user data
        const userData: UserAuth = {
          email,
          username,
          walletAddress: result.data.walletAddress,
          subOrgId: result.data.subOrgId,
          userId: result.data.userId,
          privateKeyId: result.data.privateKeyId,
          createdAt: new Date().toISOString(),
        };

        saveUserData(userData);
        setUser(userData);

        console.log('✅ Wallet created and user data saved');
        // Balance will be automatically fetched by React Query
      } else {
        setError(result.error || 'Failed to create wallet');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Error creating wallet:', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Send payment transaction using React Query mutation
  const sendPaymentTransaction = async (
    toAddress: string,
    amount: number
  ): Promise<TransactionResult> => {
    try {
      if (!user?.walletAddress) {
        throw new Error('No wallet connected');
      }

      setError(null);

      console.log('💸 Sending payment:', amount, 'sBTC to', toAddress);

      const result = await sendPaymentMutation.mutateAsync({
        fromAddress: user.walletAddress,
        toAddress,
        amount,
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

