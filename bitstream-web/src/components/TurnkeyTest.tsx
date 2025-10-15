import React from 'react';
import { useTurnkeyWallet } from '@/hooks/useTurnkeyWallet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const TurnkeyTest: React.FC = () => {
  const {
    address,
    ethAddress,
    publicKey,
    connectTurnkey,
    disconnect,
    isLoading,
    isConnected,
    authState
  } = useTurnkeyWallet();

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Turnkey Integration Test</h3>
      
      <div className="space-y-3">
        <div>
          <strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        
        <div>
          <strong>Auth State:</strong> {authState}
        </div>
        
        {address && (
          <div>
            <strong>Stacks Address:</strong>
            <div className="text-sm font-mono bg-gray-100 p-2 rounded">
              {address}
            </div>
          </div>
        )}
        
        {ethAddress && (
          <div>
            <strong>ETH Address:</strong>
            <div className="text-sm font-mono bg-gray-100 p-2 rounded">
              {ethAddress}
            </div>
          </div>
        )}
        
        {publicKey && (
          <div>
            <strong>Public Key:</strong>
            <div className="text-sm font-mono bg-gray-100 p-2 rounded">
              {publicKey.substring(0, 20)}...
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={connectTurnkey} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect Turnkey Wallet'}
            </Button>
          ) : (
            <Button 
              onClick={disconnect} 
              variant="outline"
              className="w-full"
            >
              Disconnect
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};