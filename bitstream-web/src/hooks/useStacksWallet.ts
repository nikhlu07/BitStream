/**
 * Stacks Wallet Hook - Following stacks_craftPay Pattern EXACTLY
 */

import { useState, useEffect } from 'react';
import { useTurnkey, AuthState } from '@turnkey/react-wallet-kit';
import { 
  getAddressFromPublicKey, 
  AddressHashMode,
  AddressVersion
} from '@stacks/transactions';

export const useStacksWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { handleLogin, authState, wallets, createWallet, refreshWallets } = useTurnkey();

  // Initialize wallet on mount - EXACTLY like stacks_craftPay
  useEffect(() => {
    const firstWallet = wallets?.[0];
    if (authState === AuthState.AUTHENTICATED && firstWallet) {
      const ethAddr = firstWallet.accounts?.[0]?.address;
      if (ethAddr) {
        setEthAddress(ethAddr);
        // Generate Stacks address from Turnkey public key - like stacks_craftPay
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

  // Generate Stacks address from Turnkey public key - EXACTLY like stacks_craftPay
  const generateStacksAddressFromTurnkey = async (wallet: any): Promise<string> => {
    try {
      const account = wallet.accounts?.[0];
      if (!account?.publicKey) {
        throw new Error('No public key available from Turnkey wallet');
      }

      let cleanPublicKey = account.publicKey;
      
      // Remove 0x prefix if present
      if (cleanPublicKey.startsWith('0x')) {
        cleanPublicKey = cleanPublicKey.slice(2);
      }

      // Ensure compressed public key (33 bytes = 66 hex chars)
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

      // Generate Stacks address - EXACTLY like stacks_craftPay
      const stacksAddress = getAddressFromPublicKey(
        cleanPublicKey,
        AddressVersion.TestnetSingleSig,
        AddressHashMode.SerializeP2PKH
      );

      console.log('🏠 Generated Stacks address:', stacksAddress);
      return stacksAddress;
    } catch (error) {
      console.error('Error generating Stacks address:', error);
      throw error;
    }
  };

  // Connect Turnkey - EXACTLY like stacks_craftPay
  const connectTurnkey = async () => {
    setIsLoading(true);
    try {
      await handleLogin();
      
      // After login, check if we need to create a wallet - like stacks_craftPay
      if (authState === AuthState.AUTHENTICATED && (!wallets || wallets.length === 0)) {
        console.log('🔨 Creating wallet after login...');
        
        const timestamp = Date.now();
        const uniqueWalletName = `BitStream-${timestamp}`;
        
        await createWallet({
          walletName: uniqueWalletName,
          accounts: [
            {
              curve: 'CURVE_SECP256K1',
              pathFormat: 'PATH_FORMAT_BIP32',
              path: "m/44'/60'/0'/0/0",
              addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
            }
          ]
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

  const isConnected = authState === AuthState.AUTHENTICATED && !!address;

  return {
    address,
    ethAddress,
    publicKey,
    connectTurnkey,
    disconnect,
    isLoading,
    isConnected,
    authState,
    wallets
  };
};