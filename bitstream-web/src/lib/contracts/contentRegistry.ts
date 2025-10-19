/**
 * ContentRegistry Contract Interface
 * Functions for interacting with the content registry smart contract
 */

import { Cl, PostConditionMode } from '@stacks/transactions';
import type { TurnkeySDKClientBase } from '@turnkey/react-wallet-kit';
import {
  type Network,
  type ContractCallResult,
  type ContentInfo,
  type RegisterContentParams,
  type UpdateContentMetadataParams,
  type TransferContentParams,
  DEFAULT_GAS_FEE,
} from './types';
import {
  getNetwork,
  getContractAddresses,
  signAndBroadcastTransaction,
  callReadOnlyFunction,
  parseContentInfo,
  parseContentIdList,
  validateMetadataUri,
  validateContentPrice,
  validatePrincipal,
} from './utils';

/**
 * Register new content on the blockchain
 */
export const registerContent = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  params: RegisterContentParams,
  ethAddress?: string
): Promise<ContractCallResult<{ contentId: bigint }>> => {
  // Validate inputs
  if (!validateMetadataUri(params.metadataUri)) {
    return {
      success: false,
      error: {
        code: 1004, // INVALID_METADATA
        message: 'Invalid metadata URI format',
      },
    };
  }

  if (!validateContentPrice(params.price)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid content price',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.contentRegistry.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'register-content',
    functionArgs: [
      Cl.buffer(Buffer.from(params.contentHash, 'hex')),
      Cl.stringAscii(params.metadataUri),
      Cl.uint(params.price),
    ],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  const result = await signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
  
  if (result.success) {
    // In a real implementation, you might want to parse the transaction result
    // to get the actual content ID. For now, we'll return a placeholder.
    return {
      ...result,
      data: { contentId: BigInt(0) }, // This would be parsed from transaction events
    };
  }

  return result;
};

/**
 * Update content metadata (owner only)
 */
export const updateContentMetadata = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  params: UpdateContentMetadataParams,
  ethAddress?: string
): Promise<ContractCallResult> => {
  // Validate inputs
  if (!validateMetadataUri(params.newMetadataUri)) {
    return {
      success: false,
      error: {
        code: 1004, // INVALID_METADATA
        message: 'Invalid metadata URI format',
      },
    };
  }

  if (!validateContentPrice(params.newPrice)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid content price',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.contentRegistry.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'update-content-metadata',
    functionArgs: [
      Cl.uint(params.contentId),
      Cl.stringAscii(params.newMetadataUri),
      Cl.uint(params.newPrice),
    ],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Transfer content ownership
 */
export const transferContent = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  params: TransferContentParams,
  ethAddress?: string
): Promise<ContractCallResult> => {
  // Validate inputs
  if (!validatePrincipal(params.newOwner)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid recipient address',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.contentRegistry.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'transfer-content',
    functionArgs: [
      Cl.uint(params.contentId),
      Cl.principal(params.newOwner),
    ],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Get content information by ID
 */
export const getContentInfo = async (
  network: Network,
  contentId: bigint
): Promise<ContractCallResult<ContentInfo>> => {
  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.contentRegistry,
    'content-registry',
    'get-content-info',
    [Cl.uint(contentId)]
  );

  if (result.success && result.data) {
    const contentInfo = parseContentInfo(result.data);
    if (contentInfo) {
      return {
        success: true,
        data: contentInfo,
      };
    }
  }

  return {
    success: false,
    error: {
      code: 1001, // CONTENT_NOT_FOUND
      message: 'Content not found',
    },
  };
};

/**
 * Get content information by hash
 */
export const getContentByHash = async (
  network: Network,
  contentHash: string
): Promise<ContractCallResult<ContentInfo>> => {
  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.contentRegistry,
    'content-registry',
    'get-content-by-hash',
    [Cl.buffer(Buffer.from(contentHash, 'hex'))]
  );

  if (result.success && result.data) {
    const contentInfo = parseContentInfo(result.data);
    if (contentInfo) {
      return {
        success: true,
        data: contentInfo,
      };
    }
  }

  return {
    success: false,
    error: {
      code: 1001, // CONTENT_NOT_FOUND
      message: 'Content not found',
    },
  };
};

/**
 * Get all content created by a specific creator
 */
export const getCreatorContent = async (
  network: Network,
  creator: string
): Promise<ContractCallResult<bigint[]>> => {
  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.contentRegistry,
    'content-registry',
    'get-creator-content',
    [Cl.principal(creator)]
  );

  if (result.success && result.data) {
    const contentIds = parseContentIdList(result.data);
    return {
      success: true,
      data: contentIds,
    };
  }

  return {
    success: false,
    error: {
      code: 1001, // CONTENT_NOT_FOUND
      message: 'No content found for creator',
    },
  };
};

/**
 * Get total number of registered content items
 */
export const getContentCount = async (
  network: Network
): Promise<ContractCallResult<bigint>> => {
  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.contentRegistry,
    'content-registry',
    'get-content-count',
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
      message: 'Failed to get content count',
    },
  };
};

/**
 * Check if content exists by hash
 */
export const contentExists = async (
  network: Network,
  contentHash: string
): Promise<ContractCallResult<boolean>> => {
  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.contentRegistry,
    'content-registry',
    'content-exists',
    [Cl.buffer(Buffer.from(contentHash, 'hex'))]
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
      message: 'Failed to check content existence',
    },
  };
};