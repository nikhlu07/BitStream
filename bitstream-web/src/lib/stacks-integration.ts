/**
 * Proper Stacks + Turnkey Integration
 * Based on working stacks_craftPay implementation
 */

import {
  broadcastTransaction,
  Cl,
  createMessageSignature,
  fetchFeeEstimate,
  getAddressFromPublicKey,
  makeUnsignedContractCall,
  makeUnsignedSTXTokenTransfer,
  PostConditionMode,
  type SingleSigSpendingCondition,
  sigHashPreSign,
  TransactionSigner,
  type UnsignedContractCallOptions,
  Pc,
} from '@stacks/transactions';
import type { TurnkeySDKClientBase } from '@turnkey/react-wallet-kit';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

export type Network = 'testnet' | 'mainnet';

const apiBaseUrl = {
  mainnet: 'https://api.hiro.so/extended/v1',
  testnet: 'https://api.testnet.hiro.so/extended/v1',
};

// sBTC contract addresses
const sBTCAddresses = {
  mainnet: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
  testnet: 'ST164QV81BRK296G6RTV6G1ZH208FQ36QHEPJ3K61',
} as const;

export type StacksWallet = {
  address: string;
  publicKey: string;
};

/**
 * Derive Stacks address from Turnkey public key
 */
export const getStacksWallet = (publicKey: string, network: Network): StacksWallet => {
  let cleanPublicKey = publicKey;
  if (publicKey.startsWith('0x')) {
    cleanPublicKey = publicKey.slice(2);
  }

  console.log('🔑 Deriving Stacks address from public key:', cleanPublicKey.substring(0, 20) + '...');
  console.log('🔍 Public key format:', cleanPublicKey.startsWith('04') ? 'Uncompressed' : 'Compressed');

  const address = getAddressFromPublicKey(cleanPublicKey, network);
  console.log('📍 Generated Stacks address:', address);

  return { address, publicKey: cleanPublicKey };
};

export interface SendSTXParams {
  amount: bigint;
  network: Network;
  publicKey: string;
  recipient: string;
}

/**
 * Send STX tokens with Turnkey signing
 */
export const sendSTXCore = async (
  apiClient: TurnkeySDKClientBase,
  params: SendSTXParams,
  availableBalance: bigint
) => {
  const { amount, network, publicKey, recipient } = params;

  if (availableBalance < amount) {
    throw new Error('Insufficient STX Balance');
  }

  const transaction = await makeUnsignedSTXTokenTransfer({
    amount,
    network: network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET,
    publicKey,
    recipient,
  });

  const signer = new TransactionSigner(transaction);
  const preSignSigHash = sigHashPreSign(
    signer.sigHash,
    transaction.auth.authType,
    transaction.auth.spendingCondition.fee,
    transaction.auth.spendingCondition.nonce
  );

  const payload = `0x${preSignSigHash}`;

  const signature = await apiClient.signRawPayload({
    encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
    hashFunction: 'HASH_FUNCTION_NO_OP',
    payload,
    signWith: publicKey,
  });

  const nextSig = `${signature.v}${signature.r.padStart(64, '0')}${signature.s.padStart(64, '0')}`;

  const spendingCondition = transaction.auth.spendingCondition as SingleSigSpendingCondition;
  spendingCondition.signature = createMessageSignature(nextSig);

  const feeEstimate = await fetchFeeEstimate({
    network: network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET,
    transaction,
  });

  const needed = amount + BigInt(feeEstimate);
  if (needed > availableBalance) {
    throw new Error('Insufficient STX to cover gas fee');
  }

  const result = await broadcastTransaction({
    network: network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET,
    transaction: transaction,
  });

  await waitForTransactionConfirmation(result.txid, network);
  return result;
};

export interface SendSBTCParams {
  amount: bigint;
  network: Network;
  publicKey: string;
  sender: string;
  recipient: string;
  ethAddress?: string;
}

/**
 * Send sBTC tokens with Turnkey signing
 */
export const sendSBTCCore = async (
  apiClient: TurnkeySDKClientBase,
  params: SendSBTCParams,
  availableBalance: bigint,
  availableSTXBalance: bigint
) => {
  const { amount, network, publicKey, recipient, sender, ethAddress } = params;
  const sbtcContractAddress = sBTCAddresses[network];
  const sbtcTokenAddress = `${sBTCAddresses[network]}.sbtc-token` as const;

  if (availableBalance < amount) {
    throw new Error('Insufficient sBTC Balance');
  }

  const postConditions = Pc.principal(sender).willSendEq(amount).ft(sbtcTokenAddress, 'sbtc');

  const txOptions: UnsignedContractCallOptions = {
    contractAddress: sbtcContractAddress,
    contractName: 'sbtc-token',
    functionArgs: [Cl.uint(amount), Cl.principal(sender), Cl.principal(recipient), Cl.none()],
    functionName: 'transfer',
    network: network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [postConditions],
    publicKey,
  };

  const transaction = await makeUnsignedContractCall(txOptions);

  const signer = new TransactionSigner(transaction);
  const preSignSigHash = sigHashPreSign(
    signer.sigHash,
    transaction.auth.authType,
    transaction.auth.spendingCondition.fee,
    transaction.auth.spendingCondition.nonce
  );

  const payload = `0x${preSignSigHash}`;

  // Use Ethereum address for signing if available, otherwise use public key
  const signWith = ethAddress || publicKey;
  console.log('🔐 Signing with identifier:', signWith.substring(0, 20) + '...');

  const signature = await apiClient.signRawPayload({
    encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
    hashFunction: 'HASH_FUNCTION_NO_OP',
    payload,
    signWith,
  });

  const nextSig = `${signature.v}${signature.r.padStart(64, '0')}${signature.s.padStart(64, '0')}`;
  console.log('🔐 Signature reconstructed (v+r+s):', nextSig.substring(0, 20) + '...');

  const spendingCondition = transaction.auth.spendingCondition as SingleSigSpendingCondition;
  spendingCondition.signature = createMessageSignature(nextSig);

  // Use fixed fee to avoid estimation issues
  const estimatedFee = BigInt(10000); // 0.01 STX in microSTX
  console.log('💰 Using fixed fee estimate:', estimatedFee.toString(), 'microSTX');

  if (estimatedFee > availableSTXBalance) {
    throw new Error(
      `Insufficient STX to cover gas fee. Need: ${estimatedFee}, Have: ${availableSTXBalance}`
    );
  }

  const result = await broadcastTransaction({
    network: network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET,
    transaction: transaction,
  });

  console.log('🚀 sBTC transaction broadcast successfully:', result.txid);
  await waitForTransactionConfirmation(result.txid, network);
  return result;
};

export type AccountBalanceResponse = {
  stx: { balance: string };
  fungible_tokens: Record<string, { balance: string }>;
  non_fungible_tokens: Record<string, { balance: string }>;
};

/**
 * Get user balances from Stacks blockchain
 */
export const getUserBalances = async (principal: string, network: Network) => {
  const baseUrl = apiBaseUrl[network];
  const url = `${baseUrl}/address/${principal}/balances`;
  const res = await fetch(url);
  const data = (await res.json()) as AccountBalanceResponse | { error: string; message: string };

  if ('error' in data) {
    return {
      sbtc: { decimals: 8, formatted: '0.0000', value: BigInt(0) },
      stx: { decimals: 6, formatted: '0.00', value: BigInt(0) },
    };
  }

  const sBTCBalance = data.fungible_tokens[`${sBTCAddresses[network]}.sbtc-token::sbtc`];

  return {
    sbtc: {
      decimals: 8,
      formatted: (Number(sBTCBalance?.balance ?? '0') / 1e8).toFixed(4),
      value: BigInt(sBTCBalance?.balance ?? '0'),
    },
    stx: {
      decimals: 6,
      formatted: (Number(data.stx.balance) / 1e6).toFixed(2),
      value: BigInt(data.stx.balance),
    },
  };
};

/**
 * Check transaction confirmation status
 */
export const fetchTransactionConfirmation = async (txid: string, network: Network) => {
  const baseUrl = apiBaseUrl[network];
  const url = `${baseUrl}/tx/${txid}`;

  try {
    const res = await fetch(url);

    if (res.status === 404) {
      throw new Error('Transaction not found yet - still in mempool');
    }

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = (await res.json()) as
      | { tx_status: 'success' | 'pending' | 'abort_by_response' }
      | { error: string; message: string };

    if ('error' in data) {
      throw new Error(data.message);
    }

    if (data.tx_status === 'success') {
      return true;
    } else if (data.tx_status === 'pending') {
      throw new Error('Transaction is pending');
    } else if (data.tx_status === 'abort_by_response') {
      return false;
    }

    throw new Error('Unknown transaction status');
  } catch (error) {
    throw new Error(
      `Transaction confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Wait for transaction confirmation with retry logic
 */
export const waitForTransactionConfirmation = async (txid: string, network: Network) => {
  const success = await retry(async () => await fetchTransactionConfirmation(txid, network), {
    delay: 2000,
    retries: 10,
  });

  if (!success) {
    throw new Error('Transaction failed');
  }
};

/**
 * Retry utility function
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: { delay: number; retries: number }
): Promise<T> => {
  let lastError: Error;
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < options.retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, options.delay));
      }
    }
  }
  throw lastError!;
};

/**
 * Mint sBTC for testing (testnet only)
 */
export const mintSBTCForTesting = async (
  apiClient: TurnkeySDKClientBase,
  params: {
    amount: bigint;
    network: Network;
    publicKey: string;
    recipient: string;
    ethAddress?: string;
  },
  availableSTXBalance: bigint
) => {
  const { amount, network, publicKey, ethAddress } = params;
  const sbtcContractAddress = sBTCAddresses[network];

  const txOptions: UnsignedContractCallOptions = {
    contractAddress: sbtcContractAddress,
    contractName: 'sbtc-token',
    functionArgs: [Cl.uint(amount)],
    functionName: 'mint-for-testing',
    network: network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET,
    postConditionMode: PostConditionMode.Allow,
    publicKey,
  };

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
  console.log('🔐 Mint signing with identifier:', signWith.substring(0, 20) + '...');

  const signature = await apiClient.signRawPayload({
    encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
    hashFunction: 'HASH_FUNCTION_NO_OP',
    payload,
    signWith,
  });

  const nextSig = `${signature.v}${signature.r.padStart(64, '0')}${signature.s.padStart(64, '0')}`;

  const spendingCondition = transaction.auth.spendingCondition as SingleSigSpendingCondition;
  spendingCondition.signature = createMessageSignature(nextSig);

  const estimatedFee = BigInt(10000);

  if (estimatedFee > availableSTXBalance) {
    throw new Error(
      `Insufficient STX to cover gas fee. Need: ${estimatedFee}, Have: ${availableSTXBalance}`
    );
  }

  const result = await broadcastTransaction({
    network: network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET,
    transaction: transaction,
  });

  console.log('🚀 Mint transaction broadcast successfully:', result.txid);
  await waitForTransactionConfirmation(result.txid, network);
  return result;
};
