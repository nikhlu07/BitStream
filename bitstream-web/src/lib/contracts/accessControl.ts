/**
 * AccessControl Contract Interface
 * Functions for managing content access permissions
 */

import { Cl, PostConditionMode } from '@stacks/transactions';
import type { TurnkeySDKClientBase } from '@turnkey/react-wallet-kit';
import {
  type Network,
  type ContractCallResult,
  type ContentAccess,
  type GrantAccessParams,
  type RevokeAccessParams,
  DEFAULT_GAS_FEE,
} from './types';
import {
  getNetwork,
  getContractAddresses,
  signAndBroadcastTransaction,
  callReadOnlyFunction,
  parseContentAccess,
  parseContentIdList,
  validatePrincipal,
} from './utils';

/**
 * Grant access to content (typically called by PaymentProcessor)
 */
export const grantAccess = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  params: GrantAccessParams,
  ethAddress?: string
): Promise<ContractCallResult> => {
  // Validate inputs
  if (!validatePrincipal(params.viewer)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid viewer address',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.accessControl.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'grant-access',
    functionArgs: [
      Cl.uint(params.contentId),
      Cl.principal(params.viewer),
    ],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Revoke access to content (creator or admin only)
 */
export const revokeAccess = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  params: RevokeAccessParams,
  ethAddress?: string
): Promise<ContractCallResult> => {
  // Validate inputs
  if (!validatePrincipal(params.viewer)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid viewer address',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.accessControl.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'revoke-access',
    functionArgs: [
      Cl.uint(params.contentId),
      Cl.principal(params.viewer),
    ],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Check if user has access to specific content
 */
export const hasAccess = async (
  network: Network,
  contentId: bigint,
  viewer: string
): Promise<ContractCallResult<boolean>> => {
  // Validate inputs
  if (!validatePrincipal(viewer)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid viewer address',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.accessControl,
    'access-control',
    'has-access',
    [Cl.uint(contentId), Cl.principal(viewer)]
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
      code: 3003, // ACCESS_NOT_FOUND
      message: 'Failed to check access permissions',
    },
  };
};

/**
 * Get detailed access information for content and viewer
 */
export const getAccessInfo = async (
  network: Network,
  contentId: bigint,
  viewer: string
): Promise<ContractCallResult<ContentAccess>> => {
  // Validate inputs
  if (!validatePrincipal(viewer)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid viewer address',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.accessControl,
    'access-control',
    'get-access-info',
    [Cl.uint(contentId), Cl.principal(viewer)]
  );

  if (result.success && result.data) {
    const accessInfo = parseContentAccess(result.data);
    if (accessInfo) {
      return {
        success: true,
        data: accessInfo,
      };
    }
  }

  return {
    success: false,
    error: {
      code: 3003, // ACCESS_NOT_FOUND
      message: 'Access information not found',
    },
  };
};

/**
 * Get all content accessible by a user
 */
export const getUserContentAccess = async (
  network: Network,
  viewer: string
): Promise<ContractCallResult<bigint[]>> => {
  // Validate inputs
  if (!validatePrincipal(viewer)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid viewer address',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.accessControl,
    'access-control',
    'get-user-content-access',
    [Cl.principal(viewer)]
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
      code: 3003, // ACCESS_NOT_FOUND
      message: 'No accessible content found for user',
    },
  };
};

/**
 * Get all viewers who have access to specific content
 */
export const getContentViewers = async (
  network: Network,
  contentId: bigint
): Promise<ContractCallResult<string[]>> => {
  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.accessControl,
    'access-control',
    'get-content-viewers',
    [Cl.uint(contentId)]
  );

  if (result.success && result.data && result.data.type === 'list') {
    const viewers = result.data.value.map((item: any) => item.value || '');
    return {
      success: true,
      data: viewers,
    };
  }

  return {
    success: false,
    error: {
      code: 3003, // ACCESS_NOT_FOUND
      message: 'No viewers found for content',
    },
  };
};

/**
 * Transfer access from one user to another (creator or admin only)
 */
export const transferAccess = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  contentId: bigint,
  fromViewer: string,
  toViewer: string,
  ethAddress?: string
): Promise<ContractCallResult> => {
  // Validate inputs
  if (!validatePrincipal(fromViewer) || !validatePrincipal(toViewer)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid viewer addresses',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.accessControl.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'transfer-access',
    functionArgs: [
      Cl.uint(contentId),
      Cl.principal(fromViewer),
      Cl.principal(toViewer),
    ],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Set access expiration time (creator or admin only)
 */
export const setAccessExpiration = async (
  apiClient: TurnkeySDKClientBase,
  network: Network,
  publicKey: string,
  contentId: bigint,
  viewer: string,
  expirationTime: bigint,
  ethAddress?: string
): Promise<ContractCallResult> => {
  // Validate inputs
  if (!validatePrincipal(viewer)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid viewer address',
      },
    };
  }

  const contractAddresses = getContractAddresses(network);
  const [contractAddress, contractName] = contractAddresses.accessControl.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'set-access-expiration',
    functionArgs: [
      Cl.uint(contentId),
      Cl.principal(viewer),
      Cl.uint(expirationTime),
    ],
    network: getNetwork(network),
    postConditionMode: PostConditionMode.Allow,
    publicKey,
    fee: DEFAULT_GAS_FEE,
  };

  return signAndBroadcastTransaction(apiClient, txOptions, publicKey, ethAddress);
};

/**
 * Batch check access for multiple content items
 */
export const batchCheckAccess = async (
  network: Network,
  contentIds: bigint[],
  viewer: string
): Promise<ContractCallResult<Record<string, boolean>>> => {
  // Validate inputs
  if (!validatePrincipal(viewer)) {
    return {
      success: false,
      error: {
        code: 4003, // INVALID_INPUT
        message: 'Invalid viewer address',
      },
    };
  }

  if (contentIds.length === 0) {
    return {
      success: true,
      data: {},
    };
  }

  const contractAddresses = getContractAddresses(network);

  const result = await callReadOnlyFunction(
    network,
    contractAddresses.accessControl,
    'access-control',
    'batch-check-access',
    [
      Cl.list(contentIds.map(id => Cl.uint(id))),
      Cl.principal(viewer),
    ]
  );

  if (result.success && result.data && result.data.type === 'list') {
    const accessResults: Record<string, boolean> = {};
    contentIds.forEach((contentId, index) => {
      const accessValue = result.data.value[index];
      accessResults[contentId.toString()] = accessValue?.value === true;
    });

    return {
      success: true,
      data: accessResults,
    };
  }

  return {
    success: false,
    error: {
      code: 3003, // ACCESS_NOT_FOUND
      message: 'Failed to batch check access permissions',
    },
  };
};