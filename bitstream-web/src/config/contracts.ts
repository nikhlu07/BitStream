/**
 * Smart Contract Configuration
 * Manages contract addresses and deployment information
 */

export interface ContractConfig {
  contentRegistry: string;
  accessControl: string;
  paymentProcessor: string;
}

export interface DeploymentInfo {
  network: string;
  deployer: string;
  timestamp: string;
  contracts: ContractConfig;
}

// Testnet contract addresses (deployed)
export const testnetContracts: ContractConfig = {
  contentRegistry: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.content-registry',
  accessControl: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.access-control',
  paymentProcessor: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.payment-processor',
};

// Mainnet contract addresses (to be deployed later)
export const mainnetContracts: ContractConfig = {
  contentRegistry: '', // To be filled when deployed to mainnet
  accessControl: '', // To be filled when deployed to mainnet
  paymentProcessor: '', // To be filled when deployed to mainnet
};

// Contract configuration by network
export const contractConfig: Record<string, ContractConfig> = {
  testnet: testnetContracts,
  mainnet: mainnetContracts,
};

/**
 * Get contract addresses for the current network
 */
export const getContractConfig = (network: string = 'testnet'): ContractConfig => {
  const config = contractConfig[network];
  if (!config) {
    throw new Error(`No contract configuration found for network: ${network}`);
  }
  return config;
};

/**
 * Get a specific contract address
 */
export const getContractAddress = (contractName: keyof ContractConfig, network: string = 'testnet'): string => {
  const config = getContractConfig(network);
  const address = config[contractName];
  
  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on ${network}`);
  }
  
  return address;
};

/**
 * Check if all contracts are deployed on a network
 */
export const areContractsDeployed = (network: string = 'testnet'): boolean => {
  const config = getContractConfig(network);
  return Object.values(config).every(address => address && address.length > 0);
};

/**
 * Deployment information for testnet
 */
export const testnetDeployment: DeploymentInfo = {
  network: 'testnet',
  deployer: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX',
  timestamp: new Date().toISOString(),
  contracts: testnetContracts,
};

// Export contract names as constants for type safety
export const CONTRACT_NAMES = {
  CONTENT_REGISTRY: 'contentRegistry' as const,
  ACCESS_CONTROL: 'accessControl' as const,
  PAYMENT_PROCESSOR: 'paymentProcessor' as const,
} as const;

export type ContractName = keyof typeof CONTRACT_NAMES;