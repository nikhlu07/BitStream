/**
 * React Query hooks for wallet operations - FIXED VERSION
 * Provides caching and automatic refetching for wallet data
 * Now properly passes httpClient, publicKey, and ethAddress for Turnkey signing
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWalletBalance, sendPayment, TransactionResult } from '@/lib/turnkey-fixed';

// Query keys for caching
export const walletQueryKeys = {
  balance: (address: string) => ['wallet', 'balance', address] as const,
  transactions: (address: string) => ['wallet', 'transactions', address] as const,
  transaction: (txId: string) => ['wallet', 'transaction', txId] as const,
};

// Stale times for different data types
const STALE_TIMES = {
  balance: 30000, // 30 seconds
  transactions: 60000, // 1 minute
  transaction: 10000, // 10 seconds for pending transactions
};

/**
 * Hook to fetch and cache wallet balance
 */
export const useWalletBalance = (address: string | undefined) => {
  return useQuery({
    queryKey: walletQueryKeys.balance(address || ''),
    queryFn: () => {
      if (!address) throw new Error('No address provided');
      return getWalletBalance(address);
    },
    enabled: !!address,
    staleTime: STALE_TIMES.balance,
    refetchInterval: STALE_TIMES.balance, // Auto-refetch every 30 seconds
  });
};

/**
 * Hook to send payment with optimistic updates
 * NOW PROPERLY INCLUDES httpClient, publicKey, and ethAddress for Turnkey signing
 */
export const useSendPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fromAddress,
      toAddress,
      amount,
      httpClient,
      publicKey,
      ethAddress,
    }: {
      fromAddress: string;
      toAddress: string;
      amount: number;
      httpClient: any; // TurnkeySDKClientBase
      publicKey: string;
      ethAddress?: string;
    }): Promise<TransactionResult> => {
      // Pass all required parameters for proper Turnkey signing
      return sendPayment(fromAddress, toAddress, amount, httpClient, publicKey, ethAddress);
    },
    onSuccess: (data, variables) => {
      // Invalidate balance query to trigger refetch
      queryClient.invalidateQueries({
        queryKey: walletQueryKeys.balance(variables.fromAddress),
      });
      
      // Invalidate transactions query
      queryClient.invalidateQueries({
        queryKey: walletQueryKeys.transactions(variables.fromAddress),
      });
      
      console.log('✅ Payment mutation successful, queries invalidated');
    },
    onError: (error) => {
      console.error('❌ Payment mutation failed:', error);
    },
  });
};

/**
 * Hook to manually refresh balance
 */
export const useRefreshBalance = () => {
  const queryClient = useQueryClient();

  return (address: string) => {
    queryClient.invalidateQueries({
      queryKey: walletQueryKeys.balance(address),
    });
  };
};
