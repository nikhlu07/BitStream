/**
 * Contract Test Component
 * Tests the integration with deployed smart contracts
 */

import React, { useState, useEffect } from 'react';
import { 
  getContentInfo, 
  getContentCount, 
  getCreatorEarnings, 
  hasAccess,
  getPlatformTreasury,
  isContractPaused
} from '@/lib/contracts';
import { getCurrentConfig, validateConfig } from '@/lib/contracts/config';
import { getCurrentNetwork } from '@/lib/contracts/utils';

interface TestResult {
  success: boolean;
  results: Record<string, boolean>;
  errors: string[];
}

export const ContractTest: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contractsValid, setContractsValid] = useState(false);

  const network = getCurrentNetwork();
  const config = getCurrentConfig();

  useEffect(() => {
    setContractsValid(validateConfig(config));
  }, [config]);

  const runTests = async () => {
    setIsLoading(true);
    const results: Record<string, boolean> = {};
    const errors: string[] = [];

    try {
      console.log('🧪 Running contract functionality tests...');

      // Test Content Registry
      try {
        console.log('Testing Content Registry...');
        const contentCount = await getContentCount();
        console.log('Content count:', contentCount);
        results.contentRegistry = true;
      } catch (error) {
        results.contentRegistry = false;
        errors.push(`Content Registry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test Payment Processor
      try {
        console.log('Testing Payment Processor...');
        const treasury = await getPlatformTreasury();
        const isPaused = await isContractPaused();
        console.log('Platform treasury:', treasury, 'Contract paused:', isPaused);
        results.paymentProcessor = true;
      } catch (error) {
        results.paymentProcessor = false;
        errors.push(`Payment Processor: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test Access Control
      try {
        console.log('Testing Access Control...');
        const testAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
        const access = await hasAccess(1, testAddress);
        console.log('Access check result:', access);
        results.accessControl = true;
      } catch (error) {
        results.accessControl = false;
        errors.push(`Access Control: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      const allSuccessful = Object.values(results).every(result => result === true);

      setTestResult({
        success: allSuccessful,
        results,
        errors,
      });

      console.log('✅ Contract tests completed:', { success: allSuccessful, results, errors });
    } catch (error) {
      console.error('❌ Contract tests failed:', error);
      setTestResult({
        success: false,
        results,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testContentInfo = async () => {
    try {
      console.log('🔍 Testing content info retrieval...');
      const contentInfo = await getContentInfo(1);
      console.log('Content info for ID 1:', contentInfo);
      
      if (contentInfo) {
        alert(`Content found: ${contentInfo.metadataUri} by ${contentInfo.creator}`);
      } else {
        alert('No content found with ID 1 (this is expected if no content has been registered yet)');
      }
    } catch (error) {
      console.error('❌ Error testing content info:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testCreatorEarnings = async () => {
    try {
      console.log('💰 Testing creator earnings...');
      const testAddress = config.adminAddress;
      const earnings = await getCreatorEarnings(testAddress);
      console.log('Creator earnings:', earnings);
      
      alert(`Creator earnings for ${testAddress}: ${earnings} microSTX`);
    } catch (error) {
      console.error('❌ Error testing creator earnings:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Smart Contract Integration Test
      </h2>
      
      {/* Network Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Network Information</h3>
        <p className="text-sm text-blue-600">
          <strong>Network:</strong> {network}
        </p>
        <p className="text-sm text-blue-600">
          <strong>Configuration Valid:</strong> {contractsValid ? '✅ Yes' : '❌ No'}
        </p>
      </div>

      {/* Contract Addresses */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Contract Addresses</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Content Registry:</strong>
            <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
              {config.addresses.contentRegistry}
            </code>
          </div>
          <div>
            <strong>Access Control:</strong>
            <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
              {config.addresses.accessControl}
            </code>
          </div>
          <div>
            <strong>Payment Processor:</strong>
            <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
              {config.addresses.paymentProcessor}
            </code>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6 space-y-4">
        <button
          onClick={runTests}
          disabled={isLoading || !contractsValid}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Running Tests...' : 'Test Contract Functionality'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testContentInfo}
            disabled={!contractsValid}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Test Content Info
          </button>
          
          <button
            onClick={testCreatorEarnings}
            disabled={!contractsValid}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Test Creator Earnings
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">
            Test Results {testResult.success ? '✅' : '❌'}
          </h3>
          
          {/* Individual Contract Results */}
          <div className="space-y-2 mb-4">
            {Object.entries(testResult.results).map(([contract, success]) => (
              <div key={contract} className="flex items-center justify-between">
                <span className="font-medium capitalize">
                  {contract.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className={success ? 'text-green-600' : 'text-red-600'}>
                  {success ? '✅ Working' : '❌ Failed'}
                </span>
              </div>
            ))}
          </div>

          {/* Errors */}
          {testResult.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {testResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {testResult.success && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 All contracts are deployed and accessible!
              </p>
              <p className="text-green-600 text-sm mt-1">
                The frontend can now interact with the smart contracts on {network}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!contractsValid && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Configuration Issues</h4>
          <p className="text-yellow-700 text-sm">
            The contract configuration is invalid. Please check the contract addresses and network settings.
          </p>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">📝 Usage Instructions</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Visit <code>/test-contracts</code> to access this test page</li>
          <li>• Click "Test Contract Functionality" to verify all contracts are working</li>
          <li>• Use individual test buttons to check specific contract functions</li>
          <li>• Check browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractTest;