/**
 * Proper Turnkey Wallet Hook for Stacks
 * Based on working stacks_craftPay implementation
 */

import { useState, useEffect } from 'react';
import { useTurnkey, AuthState } from '@turnkey/react-wallet-kit';
import { getStacksWallet } from '@/lib/stacks-integration';

export interface WalletState {
  address: string | null;
  ethAddress: string | null;
  publicKey: string | null;
  isConnected: boolean;
  isLoading: boolean;
}

export const useTurnkeyWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    handleLogin, 
    authState, 
    wallets, 
    createWallet, 
    refreshWallets,
    httpClient 
  } = useTurnkey();

  // Initialize wallet on mount
  useEffect(() => {
    if (authState === AuthState.Authenticated && wallets.length > 0) {
      const firstWallet = wallets[0];
      const ethAddr = firstWallet.accounts?.[0]?.address;
      
      if (ethAddr) {
        setEthAddress(ethAddr);
        
        // Generate proper Stacks address from Turnkey's public key
        generateStacksAddressFromTurnkey(firstWallet)
          .then((stacksAddr) => {
            setAddress(stacksAddr);
            console.log('🔗 Wallet connected with valid Stacks address:', stacksAddr);
            console.log('📝 Derived from Ethereum address:', ethAddr);
          })
          .catch((err) => {
            console.error('❌ Failed to generate Stacks address:', err);
          });
      }
    } else {
      setAddress(null);
      setEthAddress(null);
      setPublicKey(null);
    }
  }, [authState, wallets]);

  // Generate proper Stacks address from Turnkey public key
  const generateStacksAddressFromTurnkey = async (wallet: any): Promise<string> => {
    try {
      // Get the public key from Turnkey wallet
      const account = wallet.accounts?.[0];
      if (!account?.publicKey) {
        throw new Error('No public key available from Turnkey wallet');
      }

      const pubKey = account.publicKey;
      console.log('🔑 Raw public key from Turnkey:', pubKey.substring(0, 20) + '...');
      
      setPublicKey(pubKey);

      // Use the proper derivation function
      const { address: stacksAddress } = getStacksWallet(pubKey, 'testnet');

      return stacksAddress;
    } catch (error) {
      console.error('Error generating Stacks address from public key:', error);
      throw error;
    }
  };

  const connectTurnkey = async () => {
    setIsLoading(true);
    try {
      await handleLogin();
      
      // After login, check if we need to create a wallet
      if (authState === AuthState.Authenticated && wallets.length === 0) {
        console.log('🔨 Creating new wallet with Stacks BIP-44 path...');
        
        // Create wallet with proper Stacks configuration
        await createWallet({
          walletName: `BitStream-${Date.now()}`,
          accounts: [{
            addressFormat: 'ADDRESS_FORMAT_UNCOMPRESSED',
            curve: 'CURVE_SECP256K1',
            path: "m/44'/5757'/0'/0/0", // Official Stacks BIP-44 path
            pathFormat: 'PATH_FORMAT_BIP32'
          }]
        });
        
        await refreshWallets();
      }
    } catch (err) {
      console.error('Turnkey connect error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setEthAddress(null);
    setPublicKey(null);
  };

  const isConnected = authState === AuthState.Authenticated && !!address;

  return {
    address,
    ethAddress,
    publicKey,
    connectTurnkey,
    disconnect,
    isLoading,
    isConnected,
    authState,
    wallets,
    httpClient // Export httpClient for transaction signing
  };
};
