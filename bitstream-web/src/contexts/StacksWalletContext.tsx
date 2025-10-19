/**
 * Stacks Wallet Context Provider
 * Manages wallet state using Stacks Connect (Leather, Xverse, etc.)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  showConnect, 
  disconnect, 
  openContractCall,
  openSTXTransfer,
  FinishedTxData,
  UserSession,
  AppConfig
} from '@stacks/connect';
import { 
  StacksTestnet, 
  StacksMainnet 
} from '@stacks/network';
import {
  uintCV,
  principalCV,
  stringAsciiCV,
  bufferCV,
  PostConditionMode,
  AnchorMode
} from '@stacks/transactions';
import { getCurrentNetwork } from '@/config/network';

interface StacksWalletContextType {
  // State
  userSession: UserSession | null;
  userData: any | null;
  address: string | null;
  balance: number;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;

  // Wallet operations
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;

  // Transaction operations
  sendSTX: (recipient: string, amount: number, memo?: string) => Promise<any>;
  callContract: (contractAddress: string, contractName: string, functionName: string, functionArgs: any[]) => Promise<any>;

  // BitStream specific contract calls
  registerContent: (contentHash: string, metadataUri: string, price: number) => Promise<any>;
  purchaseContent: (contentId: number, paymentAmount: number) => Promise<any>;
  withdrawEarnings: () => Promise<any>;

  // Error handling
  clearError: () => void;
}

const StacksWalletContext = createContext<StacksWalletContextType | undefined>(undefined);

// App configuration for Stacks Connect
const appConfig = new AppConfig(['store_write', 'publish_data']);

export const StacksWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [userData, setUserData] = useState<any | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const network = getCurrentNetwork() === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
  const isConnected = userData !== null;

  // Check if user is already signed in on mount
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserData(userData);
      setAddress(userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet);
      console.log('✅ User already connected:', userData.profile.stxAddress);
    }
  }, [userSession]);

  // Fetch balance when address changes
  useEffect(() => {
    if (address) {
      refreshBalance();
    }
  }, [address]);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      showConnect({
        appDetails: {
          name: 'BitStream',
          icon: window.location.origin + '/favicon.ico',
        },
        redirectTo: '/',
        onFinish: () => {
          const userData = userSession.loadUserData();
          setUserData(userData);
          const userAddress = getCurrentNetwork() === 'mainnet' 
            ? userData.profile.stxAddress.mainnet 
            : userData.profile.stxAddress.testnet;
          setAddress(userAddress);
          console.log('✅ Wallet connected:', userAddress);
        },
        onCancel: () => {
          console.log('❌ User cancelled wallet connection');
          setError('Wallet connection cancelled');
        },
        userSession,
      });
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    try {
      disconnect();
      setUserData(null);
      setAddress(null);
      setBalance(0);
      setError(null);
      console.log('👋 Wallet disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet');
    }
  };

  const refreshBalance = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      const networkConfig = getCurrentNetwork() === 'mainnet' 
        ? 'https://api.hiro.so' 
        : 'https://api.testnet.hiro.so';

      const response = await fetch(`${networkConfig}/extended/v1/address/${address}/balances`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      const stxBalance = parseInt(data.stx?.balance || '0') / 1000000; // Convert microSTX to STX
      setBalance(stxBalance);
      console.log('💰 Balance updated:', stxBalance, 'STX');
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  const sendSTX = async (recipient: string, amount: number, memo?: string) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountInMicroSTX = Math.floor(amount * 1000000);

      return new Promise((resolve, reject) => {
        openSTXTransfer({
          recipient,
          amount: amountInMicroSTX.toString(),
          memo: memo || '',
          network,
          appDetails: {
            name: 'BitStream',
            icon: window.location.origin + '/favicon.ico',
          },
          onFinish: (data: FinishedTxData) => {
            console.log('✅ STX transfer successful:', data.txId);
            refreshBalance(); // Refresh balance after transaction
            resolve({ success: true, txId: data.txId });
          },
          onCancel: () => {
            console.log('❌ STX transfer cancelled');
            reject(new Error('Transaction cancelled'));
          },
        });
      });
    } catch (error) {
      console.error('❌ Error sending STX:', error);
      setError(error instanceof Error ? error.message : 'Failed to send STX');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const callContract = async (
    contractAddress: string, 
    contractName: string, 
    functionName: string, 
    functionArgs: any[]
  ) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      return new Promise((resolve, reject) => {
        openContractCall({
          network,
          contractAddress,
          contractName,
          functionName,
          functionArgs,
          postConditionMode: PostConditionMode.Allow,
          anchorMode: AnchorMode.Any,
          appDetails: {
            name: 'BitStream',
            icon: window.location.origin + '/favicon.ico',
          },
          onFinish: (data: FinishedTxData) => {
            console.log('✅ Contract call successful:', data.txId);
            resolve({ success: true, txId: data.txId });
          },
          onCancel: () => {
            console.log('❌ Contract call cancelled');
            reject(new Error('Transaction cancelled'));
          },
        });
      });
    } catch (error) {
      console.error('❌ Error calling contract:', error);
      setError(error instanceof Error ? error.message : 'Failed to call contract');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // BitStream specific contract functions
  const registerContent = async (contentHash: string, metadataUri: string, price: number) => {
    const contractAddress = 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX';
    const contractName = 'content-registry';
    
    // Convert content hash to buffer (assuming it's a hex string)
    const hashBuffer = Buffer.from(contentHash.replace('0x', ''), 'hex');
    
    const functionArgs = [
      bufferCV(hashBuffer),
      stringAsciiCV(metadataUri),
      uintCV(price),
      principalCV(address!)
    ];

    return callContract(contractAddress, contractName, 'register-content', functionArgs);
  };

  const purchaseContent = async (contentId: number, paymentAmount: number) => {
    const contractAddress = 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX';
    const contractName = 'payment-processor';
    
    const functionArgs = [
      uintCV(contentId),
      uintCV(paymentAmount)
    ];

    return callContract(contractAddress, contractName, 'purchase-content', functionArgs);
  };

  const withdrawEarnings = async () => {
    const contractAddress = 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX';
    const contractName = 'payment-processor';
    
    return callContract(contractAddress, contractName, 'withdraw-earnings', []);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <StacksWalletContext.Provider
      value={{
        userSession,
        userData,
        address,
        balance,
        isLoading,
        isConnected,
        error,
        connectWallet,
        disconnectWallet,
        refreshBalance,
        sendSTX,
        callContract,
        registerContent,
        purchaseContent,
        withdrawEarnings,
        clearError,
      }}
    >
      {children}
    </StacksWalletContext.Provider>
  );
};

// Custom hook to use Stacks wallet context
export const useStacksWallet = () => {
  const context = useContext(StacksWalletContext);
  if (context === undefined) {
    throw new Error('useStacksWallet must be used within a StacksWalletProvider');
  }
  return context;
};