/**
 * Stacks Wallet Connection Button
 * Simple button to connect/disconnect Stacks wallets (Leather, Xverse, etc.)
 */

import React from 'react';
import { useStacksWallet } from '@/contexts/StacksWalletContext';

export const StacksWalletButton: React.FC = () => {
  const {
    isConnected,
    address,
    balance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    clearError,
  } = useStacksWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">Wallet Connected</span>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Address:</p>
          <p className="font-mono text-sm font-medium">{formatAddress(address)}</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Balance:</p>
          <p className="font-medium">{balance.toFixed(6)} STX</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={refreshBalance}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          
          <button
            onClick={disconnectWallet}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
        
        {error && (
          <div className="text-xs text-red-600 text-center">
            {error}
            <button
              onClick={clearError}
              className="ml-2 underline hover:no-underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg border">
      <button
        onClick={connectWallet}
        disabled={isLoading}
        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Connecting...' : 'Connect Stacks Wallet'}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        Connect your Leather, Xverse, or other Stacks wallet
      </p>
      
      {error && (
        <div className="text-xs text-red-600 text-center">
          {error}
          <button
            onClick={clearError}
            className="ml-2 underline hover:no-underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default StacksWalletButton;