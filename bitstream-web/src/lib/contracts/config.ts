/**
 * Contract configuration management for different environments
 */

import { type Network, type ContractAddresses } from './types';

export interface ContractConfig {
  network: Network;
  addresses: ContractAddresses;
  adminAddress: string;
  treasuryAddress: string;
  platformFeePercentage: number; // in basis points (e.g., 1000 = 10%)
  maxContentPrice: bigint; // in microSTX
  gasEstimate: bigint; // in microSTX
}

// Environment-specific configurations
export const TESTNET_CONFIG: ContractConfig = {
  network: 'testnet',
  addresses: {
    contentRegistry: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.content-registry',
    paymentProcessor: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.payment-processor',
    accessControl: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.access-control',
  },
  adminAddress: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX',
  treasuryAddress: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX',
  platformFeePercentage: 1000, // 10%
  maxContentPrice: BigInt('1000000000'), // 1000 STX
  gasEstimate: BigInt('10000'), // 0.01 STX
};

export const MAINNET_CONFIG: ContractConfig = {
  network: 'mainnet',
  addresses: {
    contentRegistry: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.content-registry',
    paymentProcessor: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-processor',
    accessControl: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.access-control',
  },
  adminAddress: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  treasuryAddress: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  platformFeePercentage: 1000, // 10%
  maxContentPrice: BigInt('1000000000'), // 1000 STX
  gasEstimate: BigInt('15000'), // 0.015 STX (higher for mainnet)
};

/**
 * Get configuration for the specified network
 */
export const getConfig = (network: Network): ContractConfig => {
  switch (network) {
    case 'testnet':
      return TESTNET_CONFIG;
    case 'mainnet':
      return MAINNET_CONFIG;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
};

/**
 * Update contract addresses in configuration
 */
export const updateContractAddresses = (
  network: Network,
  addresses: Partial<ContractAddresses>
): ContractConfig => {
  const config = getConfig(network);
  return {
    ...config,
    addresses: {
      ...config.addresses,
      ...addresses,
    },
  };
};

/**
 * Validate contract configuration
 */
export const validateConfig = (config: ContractConfig): boolean => {
  // Check that all contract addresses are provided
  const { contentRegistry, paymentProcessor, accessControl } = config.addresses;
  
  if (!contentRegistry || !paymentProcessor || !accessControl) {
    console.error('Missing contract addresses in configuration');
    return false;
  }

  // Validate address format (basic Stacks address validation)
  const addressPattern = /^S[PT][0-9A-Z]{39}\.[a-z0-9-]+$/;
  
  if (!addressPattern.test(contentRegistry) || 
      !addressPattern.test(paymentProcessor) || 
      !addressPattern.test(accessControl)) {
    console.error('Invalid contract address format');
    return false;
  }

  // Validate admin and treasury addresses
  const principalPattern = /^S[PT][0-9A-Z]{39}$/;
  
  if (!principalPattern.test(config.adminAddress) || 
      !principalPattern.test(config.treasuryAddress)) {
    console.error('Invalid admin or treasury address format');
    return false;
  }

  // Validate platform fee percentage (0-10000 basis points = 0-100%)
  if (config.platformFeePercentage < 0 || config.platformFeePercentage > 10000) {
    console.error('Platform fee percentage must be between 0 and 10000 basis points');
    return false;
  }

  // Validate max content price
  if (config.maxContentPrice <= 0n) {
    console.error('Max content price must be greater than 0');
    return false;
  }

  // Validate gas estimate
  if (config.gasEstimate <= 0n) {
    console.error('Gas estimate must be greater than 0');
    return false;
  }

  return true;
};

/**
 * Get current environment from environment variables or default to testnet
 */
export const getCurrentNetwork = (): Network => {
  if (typeof window !== 'undefined') {
    // Browser environment
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'testnet';
    }
    // Add logic for production domain detection
    return 'mainnet';
  }
  
  // Node.js environment
  const env = process.env.NODE_ENV || 'development';
  const stacksNetwork = process.env.VITE_STACKS_NETWORK || process.env.STACKS_NETWORK;
  
  if (stacksNetwork === 'mainnet') {
    return 'mainnet';
  }
  
  return 'testnet';
};

/**
 * Get current configuration based on environment
 */
export const getCurrentConfig = (): ContractConfig => {
  const network = getCurrentNetwork();
  return getConfig(network);
};

/**
 * Environment variable configuration
 */
export interface EnvConfig {
  VITE_STACKS_NETWORK?: string;
  VITE_CONTENT_REGISTRY_ADDRESS?: string;
  VITE_PAYMENT_PROCESSOR_ADDRESS?: string;
  VITE_ACCESS_CONTROL_ADDRESS?: string;
  VITE_ADMIN_ADDRESS?: string;
  VITE_TREASURY_ADDRESS?: string;
  VITE_PLATFORM_FEE_PERCENTAGE?: string;
}

/**
 * Load configuration from environment variables
 */
export const loadConfigFromEnv = (): Partial<ContractConfig> => {
  const env = import.meta.env as EnvConfig;
  
  const config: Partial<ContractConfig> = {};
  
  if (env.VITE_STACKS_NETWORK) {
    config.network = env.VITE_STACKS_NETWORK as Network;
  }
  
  if (env.VITE_CONTENT_REGISTRY_ADDRESS || 
      env.VITE_PAYMENT_PROCESSOR_ADDRESS || 
      env.VITE_ACCESS_CONTROL_ADDRESS) {
    config.addresses = {
      contentRegistry: env.VITE_CONTENT_REGISTRY_ADDRESS || '',
      paymentProcessor: env.VITE_PAYMENT_PROCESSOR_ADDRESS || '',
      accessControl: env.VITE_ACCESS_CONTROL_ADDRESS || '',
    };
  }
  
  if (env.VITE_ADMIN_ADDRESS) {
    config.adminAddress = env.VITE_ADMIN_ADDRESS;
  }
  
  if (env.VITE_TREASURY_ADDRESS) {
    config.treasuryAddress = env.VITE_TREASURY_ADDRESS;
  }
  
  if (env.VITE_PLATFORM_FEE_PERCENTAGE) {
    config.platformFeePercentage = parseInt(env.VITE_PLATFORM_FEE_PERCENTAGE, 10);
  }
  
  return config;
};

/**
 * Merge environment configuration with defaults
 */
export const getConfigWithEnvOverrides = (network?: Network): ContractConfig => {
  const targetNetwork = network || getCurrentNetwork();
  const baseConfig = getConfig(targetNetwork);
  const envConfig = loadConfigFromEnv();
  
  return {
    ...baseConfig,
    ...envConfig,
    addresses: {
      ...baseConfig.addresses,
      ...(envConfig.addresses || {}),
    },
  };
};