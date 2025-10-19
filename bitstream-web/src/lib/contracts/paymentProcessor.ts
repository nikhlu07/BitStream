/**
 * PaymentProcessor Contract Interface
 * Functions for handling payments and revenue distribution
 */

import { Cl, PostConditionMode, Pc } from '@stacks/transactions';
import type { TurnkeySDKClientBase } from '@turnkey/react-wallet-kit';
import {
  type Network,
  type ContractCallResult,
  type CreatorEarnings,
  type PurchaseContentParams,
  DEFAULT_GAS_FEE,
} from './types';
import {
  getNetwork,
  getContractAddresses,
  signAndBroadcastTransaction,
  callReadOnlyFunction,
  parseCreatorEarnings,
  validatePrincipal,
} from './utils';

/**
 * Purchase content access with STX payment
 */
export const purchaseContent = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  userAddress: string,
  params: PurchaseContentParams,
  ethAddress?: string
): Promise<ContractCallResult> => {
  // Validate inputs
  if (params.paymentAmount <= 0n) {
    return {
      success: false,
      error: {
        code: 2001, // INSUFFICIENT_PAYMENT
        message: 'Payment amount must be greater than zero',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.paymentProcessor.split('.');

  // Create post condition to ensure STX transfer
  const postConditions = [
    Pc.principal(userAddress).willSendEq(params.paymentAmount).ustx(),
  ];

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'purchase-content',
    functionArgs: [
      Cl.uint(params.contentId),
      Cl.uint(params.paymentAmount),
    ],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Withdraw creator earnings
 */
export const withdrawEarnings = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  ethAddress?: string
): Promise<ContractCallResult> => {
  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.paymentProcessor.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'withdraw-earnings',
    functionArgs: [],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Get creator earnings balance
 */
export const getCreatorEarnings = async (
  network: Network,
  creator: string
): Promise<ContractCallResult<CreatorEarnings>> => {
  // Validate inputs
  if (!validatePrincipal(creator)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid creator address',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.paymentProcessor,
    'payment-processor',
    'get-creator-earnings',
    [Cl.principal(creator)]
  );

  if (result.success && result.data) {
    if (result.data.type === 'uint') {
      return {
        success: true,
        data: { balance: BigInt(result.data.value) },
      };
    }
    
    const earnings = parseCreatorEarnings(result.data);
    if (earnings) {
      return {
        success: true,
        data: earnings,
      };
    }
  }

  return {
    success: false,
    error: {
      code: 2003, // NO_EARNINGS
      message: 'No earnings found for creator',
    },
  };
};

/**
 * Get platform treasury balance
 */
export const getPlatformTreasury = async (
  network: Network
): Promise<ContractCallResult<bigint>> => {
  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.paymentProcessor,
    'payment-processor',
    'get-platform-treasury',
    []
  );

  if (result.success && result.data && result.data.type === 'uint') {
    return {
      success: true,
      data: BigInt(result.data.value),
    };
  }

  return {
    success: false,
    error: {
      code: 4003, // INVALID_INPUT
      message: 'Failed to get platform treasury balance',
    },
  };
};

/**
 * Get current platform fee percentage
 */
export const getPlatformFeePercentage = async (
  network: Network
): Promise<ContractCallResult<bigint>> => {
  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.paymentProcessor,
    'payment-processor',
    'get-platform-fee-percentage',
    []
  );

  if (result.success && result.data && result.data.type === 'uint') {
    return {
      success: true,
      data: BigInt(result.data.value),
    };
  }

  return {
    success: false,
    error: {
      code: 4003, // INVALID_INPUT
      message: 'Failed to get platform fee percentage',
    },
  };
};

/**
 * Set platform fee percentage (admin only)
 */
export const setPlatformFee = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  newFeePercentage: bigint,
  ethAddress?: string
): Promise<ContractCallResult> => {
  // Validate fee percentage (should be between 0 and 10000 basis points = 100%)
  if (newFeePercentage < 0n || newFeePercentage > 10000n) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Fee percentage must be between 0 and 10000 basis points',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.paymentProcessor.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'set-platform-fee',
    functionArgs: [Cl.uint(newFeePercentage)],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Pause contract (admin only)
 */
export const pauseContract = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  ethAddress?: string
): Promise<ContractCallResult> => {
  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.paymentProcessor.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'pause-contract',
    functionArgs: [],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Unpause contract (admin only)
 */
export const unpauseContract = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  ethAddress?: string
): Promise<ContractCallResult> => {
  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.paymentProcessor.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'unpause-contract',
    functionArgs: [],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Check if contract is paused
 */
export const isContractPaused = async (
  network: Network
): Promise<ContractCallResult<boolean>> => {
  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.paymentProcessor,
    'payment-processor',
    'is-paused',
    []
  );

  if (result.success && result.data && result.data.type === 'bool') {
    return {
      success: true,
      data: result.data.value,
    };
  }

  return {
    success: false,
    error: {
      code: 4003, // INVALID_INPUT
      message: 'Failed to check contract pause status',
    },
  };
};

/**
 * Calculate revenue split for a given amount
 */
export const calculateRevenueSplit = async (
  network: Network,
  amount: bigint
): Promise<ContractCallResult<{ creatorShare: bigint; platformShare: bigint }>> => {
  const feeResult = await getPlatformFeePercentage(network);
  
  if (!feeResult.success || !feeResult.data) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Failed to get platform fee percentage',
      },
    };
  }

  const feePercentage = feeResult.data;
  const platformShare = (amount * feePercentage) / 10000n; // Convert basis points to percentage
  const creatorShare = amount - platformShare;

  return {
    success: true,
    data: {
      creatorShare,
      platformShare,
    },
  };
};