/**
 * Contract Test Component
 * Tests the integration with deployed smart contracts and Stacks wallet
 */

import React, { useState } from 'react';
import { useStacksWallet } from '@/contexts/StacksWalletContext';
import { useWallet } from '@/contexts/WalletContext';
import WalletSelector from './WalletSelector';

export const ContractTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    isConnected: stacksConnected,
    address: stacksAddress,
    balance: stacksBalance,
    sendSTX,
    registerContent,
    purchaseContent,
    withdrawEarnings,
  } = useStacksWallet();

  const {
    isAuthenticated: turnkeyAuthenticated,
    user: turnkeyUser,
    balance: turnkeyBalance,
  } = useWallet();

  const isConnected = stacksConnected || turnkeyAuthenticated;
  const address = stacksAddress || turnkeyUser?.walletAddress;
  const balance = stacksBalance || turnkeyBalance;

  const testSendSTX = async () => {
    if (!isConnected) {
      setTestResult('❌ Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setTestResult('🔄 Sending 0.001 STX to test address...');
      
      const result = await sendSTX('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 0.001, 'BitStream test transaction');
      
      if (result.success) {
        setTestResult(`✅ STX sent successfully! Transaction ID: ${result.txId}`);
      } else {
        setTestResult('❌ Transaction failed or was cancelled');
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRegisterContent = async () => {
    if (!isConnected) {
      setTestResult('❌ Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setTestResult('🔄 Registering test content...');
      
      const contentHash = '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef12345678';
      const metadataUri = 'ipfs://QmTestContent123';
      const price = 1000000; // 1 STX in microSTX
      
      const result = await registerContent(contentHash, metadataUri, price);
      
      if (result.success) {
        setTestResult(`✅ Content registered successfully! Transaction ID: ${result.txId}`);
      } else {
        setTestResult('❌ Content registration failed or was cancelled');
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPurchaseContent = async () => {
    if (!isConnected) {
      setTestResult('❌ Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setTestResult('🔄 Purchasing content...');
      
      const contentId = 1;
      const paymentAmount = 1000000; // 1 STX in microSTX
      
      const result = await purchaseContent(contentId, paymentAmount);
      
      if (result.success) {
        setTestResult(`✅ Content purchased successfully! Transaction ID: ${result.txId}`);
      } else {
        setTestResult('❌ Content purchase failed or was cancelled');
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithdrawEarnings = async () => {
    if (!isConnected) {
      setTestResult('❌ Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setTestResult('🔄 Withdrawing earnings...');
      
      const result = await withdrawEarnings();
      
      if (result.success) {
        setTestResult(`✅ Earnings withdrawn successfully! Transaction ID: ${result.txId}`);
      } else {
        setTestResult('❌ Earnings withdrawal failed or was cancelled');
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        BitStream Smart Contract & Wallet Test
      </h2>
      
      {/* Wallet Connection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Wallet Connection</h3>
        <WalletSelector />
      </div>

      {/* Contract Addresses */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Testnet Contract Addresses</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Content Registry:</strong>
            <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
              SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.content-registry
            </code>
          </div>
          <div>
            <strong>Access Control:</strong>
            <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
              SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.access-control
            </code>
          </div>
          <div>
            <strong>Payment Processor:</strong>
            <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
              SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.payment-processor
            </code>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      {isConnected && (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Test Transactions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testSendSTX}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Send STX
            </button>
            
            <button
              onClick={testRegisterContent}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Register Content
            </button>
            
            <button
              onClick={testPurchaseContent}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Purchase Content
            </button>
            
            <button
              onClick={testWithdrawEarnings}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Withdraw Earnings
            </button>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div className="p-4 rounded-lg border bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Test Result</h3>
          <p className="font-mono text-sm whitespace-pre-wrap">{testResult}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">📝 Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. Choose your wallet type: Turnkey (easy) or Stacks wallet (advanced)</li>
          <li>2. <strong>Turnkey:</strong> Sign up with email/passkey for instant wallet</li>
          <li>3. <strong>Stacks:</strong> Connect Leather/Xverse wallet</li>
          <li>4. Get testnet STX from the faucet or use built-in faucet feature</li>
          <li>5. Once connected, try the test transactions to interact with BitStream contracts</li>
        </ul>
      </div>

      {/* Wallet Info */}
      {!isConnected && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Wallet Required</h4>
          <p className="text-yellow-700 text-sm">
            You need to connect a Stacks wallet (like Leather or Xverse) to test the smart contract interactions.
            The wallet popup will appear when you click "Connect Stacks Wallet".
          </p>
        </div>
      )}
    </div>
  );
};

export default ContractTest;