/**
 * Proper Turnkey Service for BitStream
 * Replaces broken implementation with working patterns from stacks_craftPay
 */

import { useTurnkey } from '@turnkey/react-wallet-kit';
import { 
  sendSBTCCore,
  sendSTXCore,
  getUserBalances,
  getStacksWallet,
  mintSBTCForTesting,
  type SendSBTCParams,
  type SendSTXParams,
} from './stacks-integration';

// Storage keys
export const STORAGE_KEYS = {
  USER_DATA: 'bitstream_user',
  WALLET_ADDRESS: 'bitstream_wallet_address',
  SESSION_TOKEN: 'bitstream_session',
};

// User authentication and wallet data types
export interface UserAuth {
  email: string;
  username: string;
  walletAddress: string;
  userId: string;
  createdAt: string;
}

export interface WalletCreationResult {
  success: boolean;
  data?: {
    walletAddress: string;
    userId: string;
  };
  error?: string;
}

export interface TransactionResult {
  success: boolean;
  txId?: string;
  error?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Format wallet address for display
 */
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Convert sBTC to USD (mock rate for demo)
 */
export const convertToUSD = (sbtcAmount: number): number => {
  const BTC_TO_USD = 62000; // Mock BTC price
  return sbtcAmount * BTC_TO_USD;
};

/**
 * Get wallet balance from Stacks blockchain
 * Returns both sBTC and STX balances
 */
export const getWalletBalance = async (address: string): Promise<number> => {
  try {
    // Validate address format before making API call
    if (!address || address === 'PENDING_CONNECTION' || address === 'PENDING_WALLET_CREATION' || address.length < 34) {
      console.warn('⚠️ Invalid address format, returning 0 balance');
      return 0;
    }

    // Check if address is a valid Stacks address (starts with ST or SP and is 34-39 chars)
    if (!address.match(/^(ST|SP)[A-Za-z0-9]{32,37}$/)) {
      console.warn('⚠️ Invalid Stacks address format:', address);
      return 0;
    }
    
    console.log('🔍 Fetching balance from Stacks blockchain...');
    
    const balances = await getUserBalances(address, 'testnet');
    
    // Return sBTC balance if available, otherwise STX
    const sbtcBalance = Number(balances.sbtc.formatted);
    const stxBalance = Number(balances.stx.formatted);
    
    console.log('✅ Balance fetched:', sbtcBalance, 'sBTC,', stxBalance, 'STX');
    
    return sbtcBalance > 0 ? sbtcBalance : stxBalance;
  } catch (error) {
    console.error('❌ Error fetching balance:', error);
    return 0;
  }
};

/**
 * Send sBTC payment transaction using proper Turnkey signing
 * This is the CORRECT implementation that actually works
 */
export const sendPayment = async (
  fromAddress: string,
  toAddress: string,
  amount: number,
  httpClient: any, // TurnkeySDKClientBase
  publicKey: string,
  ethAddress?: string
): Promise<TransactionResult> => {
  try {
    console.log('💸 Creating sBTC transaction...');
    console.log('  From:', fromAddress);
    console.log('  To:', toAddress);
    console.log('  Amount:', amount, 'sBTC');
    
    // Convert amount to smallest unit (8 decimals for sBTC)
    const sbtcAmount = BigInt(Math.floor(amount * 100000000));
    
    // Get current balances
    const balances = await getUserBalances(fromAddress, 'testnet');
    
    if (!httpClient) {
      throw new Error('Turnkey httpClient not available. Please ensure you are authenticated.');
    }
    
    // Use the proper sendSBTCCore function with Turnkey signing
    const result = await sendSBTCCore(
      httpClient,
      {
        amount: sbtcAmount,
        network: 'testnet',
        publicKey,
        sender: fromAddress,
        recipient: toAddress,
        ethAddress
      },
      balances.sbtc.value,
      balances.stx.value
    );
    
    console.log('🎉 Transaction broadcast successful:', result.txid);
    
    return {
      success: true,
      txId: result.txid,
    };
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
};

/**
 * Save session token to localStorage
 */
export const saveSessionToken = (token: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
    console.log('✅ Session token saved');
  } catch (error) {
    console.error('❌ Error saving session token:', error);
  }
};

/**
 * Get session token from localStorage
 */
export const getSessionToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  } catch {
    return null;
  }
};

/**
 * Save user data to localStorage
 */
export const saveUserData = (userData: UserAuth): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, userData.walletAddress);
    console.log('✅ User data saved');
  } catch (error) {
    console.error('❌ Error saving user data:', error);
  }
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): UserAuth | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Clear user data (logout)
 */
export const clearUserData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    localStorage.removeItem('bitstream_balance_cache');
    console.log('✅ User data cleared');
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
  }
};

/**
 * Get testnet sBTC tokens from faucet
 * Only works on testnet
 */
export const getTestnetTokens = async (address: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🚰 Requesting testnet tokens for:', address);
    
    // Request STX tokens from Stacks testnet faucet
    const response = await fetch(`https://api.testnet.hiro.so/extended/v1/faucets/stx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: address,
        stacking: false,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Testnet STX tokens requested:', data);
      
      return {
        success: true,
        message: `Testnet STX tokens requested! Check your balance in 2-3 minutes. TxID: ${data.txId || 'pending'}`,
      };
    } else {
      const errorText = await response.text();
      console.warn('⚠️ Faucet request failed:', errorText);
      
      return {
        success: false,
        message: 'Faucet request failed. You may have already received tokens recently.',
      };
    }
  } catch (error) {
    console.error('❌ Error requesting testnet tokens:', error);
    return {
      success: false,
      message: 'Failed to request testnet tokens. Please try again later.',
    };
  }
};
