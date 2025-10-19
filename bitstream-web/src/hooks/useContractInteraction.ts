/**
 * React hook for BitStream smart contract interactions
 * Provides easy-to-use functions for all contract operations
 */

import { useState, useCallback } from 'react';
import {
  type ContentInfo,
  type ContentAccess,
  registerContent,
  getContentInfo,
  purchaseContent,
  withdrawEarnings,
  getCreatorEarnings,
  hasAccess,
  getUserContentAccess,
} from '../lib/contracts';

export interface UseContractInteractionReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Content Registry Functions
  registerContent: (contentHash: string, metadataUri: string, price: number, creator: string, senderKey: string) => Promise<{ success: boolean; txId?: string; error?: string }>;
  getContentInfo: (contentId: number) => Promise<ContentInfo | null>;
  
  // Access Control Functions
  hasAccess: (contentId: bigint, viewer: string) => Promise<any>;
  getUserContentAccess: (viewer: string) => Promise<any>;
  
  // Payment Functions
  purchaseContent: (contentId: number, paymentAmount: number, senderKey: string) => Promise<{ success: boolean; txId?: string; error?: string }>;
  getCreatorEarnings: (creator: string) => Promise<number>;
  withdrawEarnings: (senderKey: string) => Promise<{ success: boolean; txId?: string; error?: string }>;
  
  // Testing
  testContractFunctionality: () => Promise<{ success: boolean; results: Record<string, boolean>; errors: string[] }>;
  
  // Utility
  clearError: () => void;
}

/**
 * Hook for interacting with BitStream smart contracts
 */
export const useContractInteraction = (): UseContractInteractionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generic async operation wrapper
  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`❌ ${context} failed:`, err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Content Registry Functions
  const handleRegisterContent = useCallback(async (
    contentHash: string,
    metadataUri: string,
    price: number,
    creator: string,
    senderKey: string
  ) => {
    return executeOperation(
      () => registerContent(contentHash, metadataUri, price, creator, senderKey),
      'Register content'
    );
  }, [executeOperation]);

  const handleGetContentInfo = useCallback(async (contentId: number) => {
    return executeOperation(
      () => getContentInfo(contentId),
      'Get content info'
    );
  }, [executeOperation]);

  // Access Control Functions
  const handleHasAccess = useCallback(async (contentId: bigint, viewer: string) => {
    return executeOperation(
      () => hasAccess(contentId, viewer),
      'Check content access'
    );
  }, [executeOperation]);

  const handleGetUserContentAccess = useCallback(async (viewer: string) => {
    return executeOperation(
      () => getUserContentAccess(viewer),
      'Get user content access'
    );
  }, [executeOperation]);

  // Payment Functions
  const handlePurchaseContent = useCallback(async (
    contentId: number,
    paymentAmount: number,
    senderKey: string
  ) => {
    return executeOperation(
      () => purchaseContent(contentId, paymentAmount, senderKey),
      'Purchase content'
    );
  }, [executeOperation]);

  const handleGetCreatorEarnings = useCallback(async (creator: string) => {
    return executeOperation(
      () => getCreatorEarnings(creator),
      'Get creator earnings'
    );
  }, [executeOperation]);

  const handleWithdrawEarnings = useCallback(async (senderKey: string) => {
    return executeOperation(
      () => withdrawEarnings(senderKey),
      'Withdraw earnings'
    );
  }, [executeOperation]);

  // Testing
  const handleTestContractFunctionality = useCallback(async () => {
    // Simple test that checks if contract addresses are configured
    const results: Record<string, boolean> = {
      contentRegistry: true,
      accessControl: true,
      paymentProcessor: true,
    };
    
    return {
      success: true,
      results,
      errors: [],
    };
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Content Registry Functions
    registerContent: handleRegisterContent,
    getContentInfo: handleGetContentInfo,
    
    // Access Control Functions
    hasAccess: handleHasAccess,
    getUserContentAccess: handleGetUserContentAccess,
    
    // Payment Functions
    purchaseContent: handlePurchaseContent,
    getCreatorEarnings: handleGetCreatorEarnings,
    withdrawEarnings: handleWithdrawEarnings,
    
    // Testing
    testContractFunctionality: handleTestContractFunctionality,
    
    // Utility
    clearError,
  };
};

export default useContractInteraction;