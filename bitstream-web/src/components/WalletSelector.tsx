/**
 * Wallet Selector Component
 * Allows users to choose between Turnkey (embedded) or Stacks wallets (Leather/Xverse)
 */

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useStacksWallet } from '@/contexts/StacksWalletContext';
import StacksWalletButton from './StacksWalletButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Mail, Key, ExternalLink } from 'lucide-react';

type WalletType = 'turnkey' | 'stacks' | null;

export const WalletSelector: React.FC = () => {
  const [selectedWallet, setSelectedWallet] = useState<WalletType>(null);
  const [showTurnkeySignup, setShowTurnkeySignup] = useState(false);

  // Turnkey wallet context
  const { 
    user: turnkeyUser, 
    isAuthenticated: turnkeyAuthenticated,
    signOut: turnkeySignOut 
  } = useWallet();

  // Stacks wallet context
  const { 
    isConnected: stacksConnected, 
    address: stacksAddress,
    disconnectWallet: stacksDisconnect 
  } = useStacksWallet();

  // Check if any wallet is connected
  const isAnyWalletConnected = turnkeyAuthenticated || stacksConnected;

  const handleWalletTypeSelect = (type: WalletType) => {
    setSelectedWallet(type);
    if (type === 'turnkey') {
      setShowTurnkeySignup(true);
    }
  };

  const handleDisconnectAll = () => {
    if (turnkeyAuthenticated) turnkeySignOut();
    if (stacksConnected) stacksDisconnect();
    setSelectedWallet(null);
    setShowTurnkeySignup(false);
  };

  // If any wallet is connected, show connected state
  if (isAnyWalletConnected) {
    return (
      <div className="space-y-4">
        {/* Connected Wallet Display */}
        {turnkeyAuthenticated && turnkeyUser && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Turnkey Wallet Connected</p>
                  <p className="text-sm text-green-600">{turnkeyUser.email}</p>
                  <p className="text-xs text-green-600 font-mono">
                    {turnkeyUser.walletAddress?.slice(0, 8)}...{turnkeyUser.walletAddress?.slice(-4)}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={turnkeySignOut}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Disconnect
              </Button>
            </div>
          </Card>
        )}

        {stacksConnected && stacksAddress && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">Stacks Wallet Connected</p>
                  <p className="text-sm text-blue-600">Leather/Xverse</p>
                  <p className="text-xs text-blue-600 font-mono">
                    {stacksAddress.slice(0, 8)}...{stacksAddress.slice(-4)}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={stacksDisconnect}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Disconnect
              </Button>
            </div>
          </Card>
        )}

        {/* Disconnect All Button */}
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDisconnectAll}
          className="w-full"
        >
          Disconnect All Wallets
        </Button>
      </div>
    );
  }

  // If showing Turnkey signup form
  if (showTurnkeySignup) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setShowTurnkeySignup(false);
            setSelectedWallet(null);
          }}
          className="mb-4"
        >
          ← Back to wallet selection
        </Button>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Turnkey Wallet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sign up with email and passkey to create an embedded wallet. No seed phrases required!
          </p>
          
          {/* This would integrate with your existing Turnkey signup flow */}
          <div className="space-y-4">
            <Button className="w-full" onClick={() => window.location.href = '/signup'}>
              Continue to Turnkey Signup
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Wallet selection screen
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Choose Your Wallet</h3>
        <p className="text-sm text-muted-foreground">
          Connect an existing wallet or create a new embedded wallet
        </p>
      </div>

      {/* Turnkey Option */}
      <Card 
        className="p-6 cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/50"
        onClick={() => handleWalletTypeSelect('turnkey')}
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-2">Turnkey Embedded Wallet</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Perfect for beginners. Create a wallet with just email and passkey.
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Key className="w-3 h-3" />
                <span>No seed phrases to manage</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3" />
                <span>Sign up with email + passkey</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wallet className="w-3 h-3" />
                <span>Instant wallet creation</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stacks Wallet Option */}
      <Card 
        className="p-6 cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/50"
        onClick={() => handleWalletTypeSelect('stacks')}
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-2">Stacks Wallet (Leather/Xverse)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Connect your existing Stacks wallet for full control of your keys.
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-3 h-3" />
                <span>Use existing Leather or Xverse wallet</span>
              </div>
              <div className="flex items-center space-x-2">
                <Key className="w-3 h-3" />
                <span>You control your private keys</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wallet className="w-3 h-3" />
                <span>Advanced wallet features</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stacks Wallet Connection */}
      {selectedWallet === 'stacks' && (
        <div className="mt-6">
          <StacksWalletButton />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedWallet(null)}
            className="w-full mt-2"
          >
            Choose Different Wallet
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletSelector;