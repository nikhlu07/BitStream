import { useState, useEffect } from 'react';
import { useTurnkey, AuthState } from '@turnkey/react-wallet-kit';
import { getAddressFromPublicKey } from '@stacks/transactions';

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

  const { handleLogin, authState, wallets, createWallet, refreshWallets, httpClient } = useTurnkey();

  // Initialize wallet on mount
  useEffect(() => {
    const firstWallet = wallets?.[0];
    if (authState === AuthState.Authenticated && firstWallet) {
      const ethAddr = firstWallet.accounts?.[0]?.address;
      if (ethAddr) {
        setEthAddress(ethAddr);
        // Generate a proper Stacks testnet address using Turnkey's public key
        generateStacksAddressFromTurnkey(firstWallet)
          .then((stacksAddr) => {
            setAddress(stacksAddr);
          })
          .catch((err) => {
            console.error('Failed to generate Stacks address:', err);
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

      let cleanPublicKey = account.publicKey;
      
      // Remove 0x prefix if present
      if (cleanPublicKey.startsWith('0x')) {
        cleanPublicKey = cleanPublicKey.slice(2);
      }

      // Ensure we have a compressed public key (33 bytes = 66 hex chars)
      if (cleanPublicKey.length === 130) {
        // Uncompressed key, compress it
        const x = cleanPublicKey.slice(2, 66);
        const y = cleanPublicKey.slice(66, 130);
        const yBigInt = BigInt('0x' + y);
        const prefix = yBigInt % 2n === 0n ? '02' : '03';
        cleanPublicKey = prefix + x;
      }

      console.log('🔑 Public key from Turnkey:', cleanPublicKey.substring(0, 20) + '...');
      
      setPublicKey(cleanPublicKey);

      // Generate Stacks address (testnet)
      const stacksAddress = getAddressFromPublicKey(cleanPublicKey, 'testnet');

      console.log('🏠 Generated Stacks address:', stacksAddress);
      return stacksAddress;
    } catch (error) {
      console.error('Error generating Stacks address:', error);
      throw error;
    }
  };

  const connectTurnkey = async () => {
    setIsLoading(true);
    try {
      await handleLogin();
      
      // After login, check if we need to create a wallet
      if (authState === AuthState.Authenticated && (!wallets || wallets.length === 0)) {
        console.log('🔨 Creating new wallet with Stacks BIP-44 path...');
        await createWallet({
          walletName: `BitStream-${Date.now()}`,
          accounts: [{
            addressFormat: 'ADDRESS_FORMAT_UNCOMPRESSED',
            curve: 'CURVE_SECP256K1',
            path: "m/44'/5757'/0'/0/0",
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
    // Note: Turnkey doesn't have a logout method in this version
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
    httpClient
  };
};