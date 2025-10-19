/**
 * Contract interaction utilities for BitStream Smart Contracts
 * Helper functions for contract function calls and data processing
 */

import {
  broadcastTransaction,
  Cl,
  createMessageSignature,
  makeUnsignedContractCall,
  PostConditionMode,
  sigHashPreSign,
  TransactionSigner,
  type UnsignedContractCallOptions,
  type SingleSigSpendingCondition,
  cvToJSON,
  hexToCV,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import type { TurnkeySDKClientBase } from '@turnkey/react-wallet-kit';
import {
  type Network,
  type ContractCallResult,
  type ContentInfo,
  type CreatorEarnings,
  type ContentAccess,
  ContractError,
  CONTRACT_ADDRESSES,
  DEFAULT_GAS_FEE,
} from './types';

/**
 * Get network configuration
 */
export const getNetwork = (network: Network) => {
  return network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;
};

/**
 * Get contract addresses for network
 */
export const getContractAddresses = (network: Network) => {
  return CONTRACT_ADDRESSES[network];
};

/**
 * Convert contract error code to user-friendly message
 */
export const getErrorMessage = (errorCode: ContractError): string => {
  switch (errorCode) {
    case ContractError.CONTENT_NOT_FOUND:
      return 'Content not found';
    case ContractError.NOT_CONTENT_OWNER:
      return 'You are not the owner of this content';
    case ContractError.CONTENT_ALREADY_EXISTS:
      return 'Content with this hash already exists';
    case ContractError.INVALID_METADATA:
      return 'Invalid metadata provided';
    case ContractError.INSUFFICIENT_PAYMENT:
      return 'Payment amount is insufficient';
    case ContractError.PAYMENT_FAILED:
      return 'Payment processing failed';
    case ContractError.NO_EARNINGS:
      return 'No earnings available for withdrawal';
    case ContractError.WITHDRAWAL_FAILED:
      return 'Withdrawal failed';
    case ContractError.ACCESS_DENIED:
      return 'Access denied';
    case ContractError.ACCESS_ALREADY_GRANTED:
      return 'Access already granted';
    case ContractError.ACCESS_NOT_FOUND:
      return 'Access record not found';
    case ContractError.NOT_AUTHORIZED:
      return 'Not authorized to perform this action';
    case ContractError.CONTRACT_PAUSED:
      return 'Contract is currently paused';
    case ContractError.INVALID_INPUT:
      return 'Invalid input provided';
    default:
      return 'Unknown error occurred';
  }
};

/**
 * Sign and broadcast a contract call transaction
 */
export const signAndBroadcastTransaction = async (
  apiClient: TurnkeySDKClientBase,
  txOptions: UnsignedContractCallOptions,
  publicKey: string,
  ethAddress?: string
): Promise<ContractCallResult> => {
  try {
    const transaction = await makeUnsignedContractCall(txOptions);

    const signer = new TransactionSigner(transaction);
    const preSignSigHash = sigHashPreSign(
      signer.sigHash,
      transaction.auth.authType,
      transaction.auth.spendingCondition.fee,
      transaction.auth.spendingCondition.nonce
    );

    const payload = `0x${preSignSigHash}`;
    const signWith = ethAddress || publicKey;

    const signature = await apiClient.signRawPayload({
      encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
      hashFunction: 'HASH_FUNCTION_NO_OP',
      payload,
      signWith,
    });

    const nextSig = `${signature.v}${signature.r.padStart(64, '0')}${signature.s.padStart(64, '0')}`;
    const spendingCondition = transaction.auth.spendingCondition as SingleSigSpendingCondition;
    spendingCondition.signature = createMessageSignature(nextSig);

    const result = await broadcastTransaction({
      network: txOptions.network,
      transaction: transaction,
    });

    return {
      success: true,
      txId: result.txid,
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    return {
      success: false,
      error: {
        code: ContractError.INVALID_INPUT,
        message: error instanceof Error ? error.message : 'Transaction failed',
      },
    };
  }
};

/**
 * Make a read-only contract call
 */
export const callReadOnlyFunction = async (
  network: Network,
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: any[] = []
): Promise<ContractCallResult> => {
  try {
    const baseUrl = network === 'testnet' 
      ? 'https://api.testnet.hiro.so/extended/v1'
      : 'https://api.hiro.so/extended/v1';

    const [address, name] = contractAddress.split('.');
    const url = `${baseUrl}/contracts/call-read/${address}/${name}/${functionName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: address,
        arguments: functionArgs.map(arg => `0x${arg.serialize().toString('hex')}`),
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.okay) {
      const result = hexToCV(data.result);
      return {
        success: true,
        data: cvToJSON(result),
      };
    } else {
      return {
        success: false,
        error: {
          code: ContractError.INVALID_INPUT,
          message: data.cause || 'Read-only function call failed',
        },
      };
    }
  } catch (error) {
    console.error('Read-only function call failed:', error);
    return {
      success: false,
      error: {
        code: ContractError.INVALID_INPUT,
        message: error instanceof Error ? error.message : 'Read-only function call failed',
      },
    };
  }
};

/**
 * Parse content info from contract response
 */
export const parseContentInfo = (data: any): ContentInfo | null => {
  if (!data || data.type !== 'tuple') {
    return null;
  }

  const tupleData = data.value;
  return {
    creator: tupleData.creator?.value || '',
    contentHash: tupleData['content-hash']?.value || '',
    metadataUri: tupleData['metadata-uri']?.value || '',
    price: BigInt(tupleData.price?.value || '0'),
    createdAt: BigInt(tupleData['created-at']?.value || '0'),
    updatedAt: BigInt(tupleData['updated-at']?.value || '0'),
    isActive: tupleData['is-active']?.value === true,
  };
};

/**
 * Parse creator earnings from contract response
 */
export const parseCreatorEarnings = (data: any): CreatorEarnings | null => {
  if (!data || data.type !== 'tuple') {
    return null;
  }

  return {
    balance: BigInt(data.value.balance?.value || '0'),
  };
};

/**
 * Parse content access from contract response
 */
export const parseContentAccess = (data: any): ContentAccess | null => {
  if (!data || data.type !== 'tuple') {
    return null;
  }

  const tupleData = data.value;
  return {
    grantedAt: BigInt(tupleData['granted-at']?.value || '0'),
    expiresAt: tupleData['expires-at']?.value ? BigInt(tupleData['expires-at'].value) : undefined,
    isActive: tupleData['is-active']?.value === true,
  };
};

/**
 * Parse list of content IDs from contract response
 */
export const parseContentIdList = (data: any): bigint[] => {
  if (!data || data.type !== 'list') {
    return [];
  }

  return data.value.map((item: any) => BigInt(item.value || '0'));
};

/**
 * Convert string to buffer for contract calls
 */
export const stringToBuffer = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

/**
 * Convert buffer to hex string
 */
export const bufferToHex = (buffer: Uint8Array): string => {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Generate content hash from content data
 */
export const generateContentHash = async (content: string | Uint8Array): Promise<string> => {
  const encoder = new TextEncoder();
  const data = typeof content === 'string' ? encoder.encode(content) : content;
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(new Uint8Array(hashBuffer));
};

/**
 * Format STX amount for display
 */
export const formatSTX = (microSTX: bigint, decimals: number = 2): string => {
  const stx = Number(microSTX) / 1_000_000;
  return stx.toFixed(decimals);
};

/**
 * Parse STX amount from string
 */
export const parseSTX = (stxAmount: string): bigint => {
  const amount = parseFloat(stxAmount);
  return BigInt(Math.floor(amount * 1_000_000));
};

/**
 * Validate content metadata URI
 */
export const validateMetadataUri = (uri: string): boolean => {
  try {
    const url = new URL(uri);
    return url.protocol === 'https:' || url.protocol === 'ipfs:';
  } catch {
    return false;
  }
};

/**
 * Validate content price
 */
export const validateContentPrice = (price: bigint): boolean => {
  return price > 0n && price <= BigInt('1000000000'); // Max 1000 STX
};

/**
 * Validate principal address
 */
export const validatePrincipal = (address: string): boolean => {
  // Basic validation for Stacks addresses
  return /^S[PT][0-9A-Z]{39}$/.test(address) || /^S[PT][0-9A-Z]{39}\.[a-z0-9-]+$/.test(address);
};