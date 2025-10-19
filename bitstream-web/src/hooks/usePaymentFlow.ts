/**
 * React hook for payment flow operations
 * Handles content purchases, streaming payments, and earnings management
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useContractInteraction } from './useContractInteraction';
import { useStacksWallet } from './useStacksWallet';
import {
  type CreatorEarnings,
  formatSTX,
  parseSTX,
} from '../lib/contracts';

export interface StreamingSession {
  contentId: bigint;
  startTime: number;
  lastPaymentTime: number;
  accumulatedAmount: bigint;
  totalPaid: bigint;
  isActive: boolean;
}

export interface UsePaymentFlowReturn {
  // State
  isLoading: boolean;
  error: string | null;
  earnings: CreatorEarnings | null;
  streamingSession: StreamingSession | null;
  
  // Payment Functions
  purchaseContentAccess: (contentId: bigint, price: bigint) => Promise<{ success: boolean; error?: string }>;
  startStreamingPayment: (contentId: bigint, pricePerMinute: bigint) => Promise<{ success: boolean; error?: string }>;
  stopStreamingPayment: () => Promise<{ success: boolean; error?: string }>;
  processAccumulatedPayment: () => Promise<{ success: boolean; error?: string }>;
  
  // Earnings Functions
  loadEarnings: () => Promise<void>;
  withdrawAllEarnings: () => Promise<{ success: boolean; error?: string }>;
  
  // Utility Functions
  clearError: () => void;
  getFormattedEarnings: () => string;
  getStreamingStats: () => {
    duration: number;
    totalPaid: string;
    currentRate: string;
  };
}

/**
 * Hook for managing payment flows and earnings
 */
export const usePaymentFlow = (): UsePaymentFlowReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<CreatorEarnings | null>(null);
  const [streamingSession, setStreamingSession] = useState<StreamingSession | null>(null);
  
  const { address } = useStacksWallet();
  const {
    purchaseContent,
    getCreatorEarnings,
    withdrawEarnings,
    error: contractError,
    clearError: clearContractError,
  } = useContractInteraction();

  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const paymentIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    clearContractError();
  }, [clearContractError]);

  // Purchase one-time content access
  const purchaseContentAccess = useCallback(async (
    contentId: bigint,
    price: bigint
  ): Promise<{ success: boolean; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await purchaseContent({
        contentId,
        paymentAmount: price,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to purchase content',
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [address, purchaseContent]);

  // Start streaming payment session
  const startStreamingPayment = useCallback(async (
    contentId: bigint,
    pricePerMinute: bigint
  ): Promise<{ success: boolean; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (streamingSession?.isActive) {
      return { success: false, error: 'Streaming session already active' };
    }

    const now = Date.now();
    const newSession: StreamingSession = {
      contentId,
      startTime: now,
      lastPaymentTime: now,
      accumulatedAmount: 0n,
      totalPaid: 0n,
      isActive: true,
    };

    setStreamingSession(newSession);

    // Calculate payment per second (pricePerMinute / 60)
    const paymentPerSecond = pricePerMinute / 60n;

    // Start accumulating payments every second
    streamingIntervalRef.current = setInterval(() => {
      setStreamingSession(prev => {
        if (!prev || !prev.isActive) return prev;
        
        return {
          ...prev,
          accumulatedAmount: prev.accumulatedAmount + paymentPerSecond,
        };
      });
    }, 1000);

    // Process accumulated payments every 30 seconds
    paymentIntervalRef.current = setInterval(() => {
      processAccumulatedPayment();
    }, 30000);

    return { success: true };
  }, [address, streamingSession]);

  // Stop streaming payment session
  const stopStreamingPayment = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!streamingSession?.isActive) {
      return { success: false, error: 'No active streaming session' };
    }

    // Clear intervals
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    if (paymentIntervalRef.current) {
      clearInterval(paymentIntervalRef.current);
      paymentIntervalRef.current = null;
    }

    // Process final accumulated payment
    const finalPaymentResult = await processAccumulatedPayment();

    // Mark session as inactive
    setStreamingSession(prev => prev ? { ...prev, isActive: false } : null);

    return finalPaymentResult;
  }, [streamingSession]);

  // Process accumulated streaming payment
  const processAccumulatedPayment = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!streamingSession?.isActive || streamingSession.accumulatedAmount === 0n) {
      return { success: true }; // Nothing to process
    }

    setIsLoading(true);

    try {
      const result = await purchaseContent({
        contentId: streamingSession.contentId,
        paymentAmount: streamingSession.accumulatedAmount,
      });

      if (result.success) {
        // Update session with successful payment
        setStreamingSession(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            lastPaymentTime: Date.now(),
            totalPaid: prev.totalPaid + prev.accumulatedAmount,
            accumulatedAmount: 0n,
          };
        });

        return { success: true };
      } else {
        // Payment failed - stop streaming
        await stopStreamingPayment();
        
        return {
          success: false,
          error: result.error?.message || 'Streaming payment failed',
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      
      // Stop streaming on error
      await stopStreamingPayment();
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [streamingSession, purchaseContent, stopStreamingPayment]);

  // Load creator earnings
  const loadEarnings = useCallback(async () => {
    if (!address) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCreatorEarnings(address);
      
      if (result.success && result.data) {
        setEarnings(result.data);
      } else {
        setEarnings({ balance: 0n });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load earnings';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, getCreatorEarnings]);

  // Withdraw all earnings
  const withdrawAllEarnings = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!earnings || earnings.balance === 0n) {
      return { success: false, error: 'No earnings to withdraw' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await withdrawEarnings();

      if (result.success) {
        // Refresh earnings after successful withdrawal
        await loadEarnings();
        
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to withdraw earnings',
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [address, earnings, withdrawEarnings, loadEarnings]);

  // Get formatted earnings
  const getFormattedEarnings = useCallback((): string => {
    if (!earnings) return '0.00';
    return formatSTX(earnings.balance);
  }, [earnings]);

  // Get streaming session statistics
  const getStreamingStats = useCallback(() => {
    if (!streamingSession) {
      return {
        duration: 0,
        totalPaid: '0.00',
        currentRate: '0.00',
      };
    }

    const duration = Math.floor((Date.now() - streamingSession.startTime) / 1000);
    const totalPaid = formatSTX(streamingSession.totalPaid + streamingSession.accumulatedAmount);
    const currentRate = duration > 0 
      ? formatSTX((streamingSession.totalPaid + streamingSession.accumulatedAmount) * 60n / BigInt(duration))
      : '0.00';

    return {
      duration,
      totalPaid,
      currentRate,
    };
  }, [streamingSession]);

  // Load earnings when address changes
  useEffect(() => {
    if (address) {
      loadEarnings();
    } else {
      setEarnings(null);
    }
  }, [address, loadEarnings]);

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      setError(contractError.userMessage);
    }
  }, [contractError]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
      if (paymentIntervalRef.current) {
        clearInterval(paymentIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    isLoading,
    error,
    earnings,
    streamingSession,
    
    // Payment Functions
    purchaseContentAccess,
    startStreamingPayment,
    stopStreamingPayment,
    processAccumulatedPayment,
    
    // Earnings Functions
    loadEarnings,
    withdrawAllEarnings,
    
    // Utility Functions
    clearError,
    getFormattedEarnings,
    getStreamingStats,
  };
};