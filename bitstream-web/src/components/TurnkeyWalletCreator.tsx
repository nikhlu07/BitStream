/**
 * Real Turnkey Wallet Creator - EXACTLY like stacks_craftPay
 */

import { useEffect } from 'react';
import { useTurnkey, AuthState } from '@turnkey/react-wallet-kit';
import { publicKeyToAddress } from '@stacks/transactions';
import { hexToBytes } from '@stacks/common';
import { useWallet } from '@/contexts/WalletContext';

export const TurnkeyWalletCreator = () => {
  const { handleLogin, authState, wallets, createWallet, refreshWallets } = useTurnkey();
  const { user, setUser, saveUserData } = useWallet();

  useEffect(() => {
    // If user is authenticated and has wallets, generate real Stacks address
    if (authState === AuthState.Authenticated && wallets.length > 0 && user) {
      const firstWallet = wallets[0];
      const ethAddr = firstWallet.accounts?.[0]?.address;
      
      if (ethAddr && user.walletAddress === 'PENDING_WALLET_CREATION') {
        generateRealStacksAddress(firstWallet)
          .then((stacksAddr) => {
            // Update user data with real address
            const updatedUser = {
              ...user,
              walletAddress: stacksAddr
            };
            
            saveUserData(updatedUser);
            setUser(updatedUser);
            
            console.log('✅ REAL Turnkey wallet created:', stacksAddr);
          })
          .catch((err) => {
            console.error('❌ Failed to generate real Stacks address:', err);
          });
      }
    }
  }, [authState, wallets, user]);

  // Generate REAL Stacks address from Turnkey public key - EXACTLY like stacks_craftPay
  const generateRealStacksAddress = async (wallet: any): Promise<string> => {
    try {
      const account = wallet.accounts?.[0];
      if (!account?.publicKey) {
        throw new Error('No public key available from Turnkey wallet');
      }

      // Convert hex public key to bytes - EXACTLY like stacks_craftPay
      const publicKeyHex = account.publicKey.startsWith('0x')
        ? account.publicKey.slice(2)
        : account.publicKey;
      const publicKeyBytes = hexToBytes(publicKeyHex);

      // Generate REAL Stacks testnet address - EXACTLY like stacks_craftPay
      const stacksAddress = publicKeyToAddress(publicKeyBytes, 'testnet');

      return stacksAddress;
    } catch (error) {
      console.error('Error generating real Stacks address:', error);
      throw error;
    }
  };

  // Auto-create wallet if user is authenticated but has no wallets
  useEffect(() => {
    if (authState === AuthState.Authenticated && wallets.length === 0 && user) {
      const createRealWallet = async () => {
        try {
          console.log('🔨 Creating REAL Turnkey wallet for user:', user.username);

          await createWallet({
            walletName: `BitStream-${user.username}-${Date.now()}`,
            accounts: ['ADDRESS_FORMAT_ETHEREUM']
          });
          
          await refreshWallets();
        } catch (err) {
          console.error('❌ Error creating real Turnkey wallet:', err);
        }
      };

      createRealWallet();
    }
  }, [authState, wallets.length, user, createWallet, refreshWallets]);

  return null; // This is a utility component, no UI
};