import React, { createContext, useContext, ReactNode } from 'react';

// Mock wallet context for when Turnkey is disabled
interface MockWalletContextType {
  createUserWallet: (email: string, username: string) => Promise<void>;
  isLoading: boolean;
  address: string | null;
  balance: number;
  isConnected: boolean;
}

const MockWalletContext = createContext<MockWalletContextType | undefined>(undefined);

export const MockWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mockWallet: MockWalletContextType = {
    createUserWallet: async (email: string, username: string) => {
      console.log('Mock wallet creation for:', email, username);
      // Simulate wallet creation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    isLoading: false,
    address: null,
    balance: 0,
    isConnected: false,
  };

  return (
    <MockWalletContext.Provider value={mockWallet}>
      {children}
    </MockWalletContext.Provider>
  );
};

export const useWallet = (): MockWalletContextType => {
  const context = useContext(MockWalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a MockWalletProvider');
  }
  return context;
};