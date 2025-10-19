/**
 * TypeScript interfaces for BitStream Smart Contracts
 * Matches the contract data structures from the design document
 */

// Network configuration
export type Network = 'testnet' | 'mainnet';

// Contract addresses for different networks
export interface ContractAddresses {
  contentRegistry: string;
  paymentProcessor: string;
  accessControl: string;
}

export const CONTRACT_ADDRESSES: Record<Network, ContractAddresses> = {
  testnet: {
    contentRegistry: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.content-registry',
    paymentProcessor: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.payment-processor',
    accessControl: 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX.access-control',
  },
  mainnet: {
    contentRegistry: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.content-registry',
    paymentProcessor: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-processor',
    accessControl: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.access-control',
  },
};

/**
 * Get contract addresses for the specified network
 */
export const getContractAddresses = (network: Network): ContractAddresses => {
  return CONTRACT_ADDRESSES[network];
};

/**
 * Get error message for a contract error code
 */
export const getErrorMessage = (error: ContractError): string => {
  switch (error) {
    case ContractError.CONTENT_NOT_FOUND:
      return 'Content not found';
    case ContractError.NOT_CONTENT_OWNER:
      return 'Not content owner';
    case ContractError.CONTENT_ALREADY_EXISTS:
      return 'Content already exists';
    case ContractError.INVALID_METADATA:
      return 'Invalid metadata';
    case ContractError.INSUFFICIENT_PAYMENT:
      return 'Insufficient payment';
    case ContractError.PAYMENT_FAILED:
      return 'Payment failed';
    case ContractError.NO_EARNINGS:
      return 'No earnings available';
    case ContractError.WITHDRAWAL_FAILED:
      return 'Withdrawal failed';
    case ContractError.ACCESS_DENIED:
      return 'Access denied';
    case ContractError.ACCESS_ALREADY_GRANTED:
      return 'Access already granted';
    case ContractError.ACCESS_NOT_FOUND:
      return 'Access not found';
    case ContractError.NOT_AUTHORIZED:
      return 'Not authorized';
    case ContractError.CONTRACT_PAUSED:
      return 'Contract is paused';
    case ContractError.INVALID_INPUT:
      return 'Invalid input';
    default:
      return 'Unknown error';
  }
};

// Content Registry Types
export interface ContentInfo {
  creator: string;
  contentHash: string;
  metadataUri: string;
  price: bigint;
  createdAt: bigint;
  updatedAt: bigint;
  isActive: boolean;
}

export interface ContentMetadata {
  title: string;
  description: string;
  contentType: 'video' | 'image' | 'audio' | 'document';
  thumbnailUrl: string;
  contentUrl: string;
  duration?: number;
  tags: string[];
  createdAt: string;
  fileSize: number;
  checksum: string;
}

// Payment Processor Types
export interface CreatorEarnings {
  balance: bigint;
}

export interface PaymentEvent {
  contentId: bigint;
  viewer: string;
  amount: bigint;
  creatorShare: bigint;
  platformShare: bigint;
  timestamp: bigint;
}

// Access Control Types
export interface ContentAccess {
  grantedAt: bigint;
  expiresAt?: bigint;
  isActive: boolean;
}

export interface UserContentAccess {
  contentIds: bigint[];
}

// Event Types
export interface ContentRegisteredEvent {
  contentId: bigint;
  creator: string;
  price: bigint;
  metadataUri: string;
}

export interface AccessGrantedEvent {
  contentId: bigint;
  viewer: string;
  grantedAt: bigint;
}

// Error Types
export enum ContractError {
  // Content Registry Errors
  CONTENT_NOT_FOUND = 1001,
  NOT_CONTENT_OWNER = 1002,
  CONTENT_ALREADY_EXISTS = 1003,
  INVALID_METADATA = 1004,

  // Payment Processor Errors
  INSUFFICIENT_PAYMENT = 2001,
  PAYMENT_FAILED = 2002,
  NO_EARNINGS = 2003,
  WITHDRAWAL_FAILED = 2004,

  // Access Control Errors
  ACCESS_DENIED = 3001,
  ACCESS_ALREADY_GRANTED = 3002,
  ACCESS_NOT_FOUND = 3003,

  // General Errors
  NOT_AUTHORIZED = 4001,
  CONTRACT_PAUSED = 4002,
  INVALID_INPUT = 4003,
}

export interface ContractCallResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ContractError;
    message: string;
  };
  txId?: string;
}

// Function parameter types
export interface RegisterContentParams {
  contentHash: string;
  metadataUri: string;
  price: bigint;
}

export interface UpdateContentMetadataParams {
  contentId: bigint;
  newMetadataUri: string;
  newPrice: bigint;
}

export interface PurchaseContentParams {
  contentId: bigint;
  paymentAmount: bigint;
}

export interface TransferContentParams {
  contentId: bigint;
  newOwner: string;
}

export interface GrantAccessParams {
  contentId: bigint;
  viewer: string;
}

export interface RevokeAccessParams {
  contentId: bigint;
  viewer: string;
}

// Configuration constants
export const PLATFORM_FEE_PERCENTAGE = 1000; // 10% in basis points
export const MAX_CONTENT_PRICE = BigInt('1000000000'); // 1000 STX in microSTX
export const DEFAULT_GAS_FEE = BigInt('10000'); // 0.01 STX in microSTX