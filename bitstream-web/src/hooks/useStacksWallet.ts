import { useState, useEffect } from 'react';
import { showConnect, disconnect, UserSession, AppConfig } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export interface StacksWalletState {
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  userData: any;
}

export const useStacksWallet = () => {
  const [walletState, setWalletState] = useState<StacksWalletState>({
    isConnected: false,
    address: null,
    isLoading: true,
    userData: null
  });

  // Check if user is already signed in
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setWalletState({
        isConnected: true,
        address: userData.profile.stxAddress.testnet,
        isLoading: false,
        userData
      });
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setWalletState({
          isConnected: true,
          address: userData.profile.stxAddress.testnet,
          isLoading: false,
          userData
        });
      });
    } else {
      setWalletState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'BitStream',
        icon: window.location.origin + '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: (userData) => {
        setWalletState({
          isConnected: true,
          address: userData.profile.stxAddress.testnet,
          isLoading: false,
          userData
        });
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    disconnect();
    setWalletState({
      isConnected: false,
      address: null,
      isLoading: false,
      userData: null
    });
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    userSession
  };
};