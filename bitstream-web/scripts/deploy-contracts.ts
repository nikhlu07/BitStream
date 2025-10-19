/**
 * Contract deployment script for BitStream Smart Contracts
 * Deploys contracts to testnet or mainnet in the correct order
 */

import {
  broadcastTransaction,
  makeContractDeploy,
  PostConditionMode,
  createMessageSignature,
  sigHashPreSign,
  TransactionSigner,
  type SingleSigSpendingCondition,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import type { TurnkeySDKClientBase } from '@turnkey/react-wallet-kit';
import { type Network, type ContractConfig } from '../src/lib/contracts/config';

export interface DeploymentConfig {
  network: Network;
  publicKey: string;
  apiClient: TurnkeySDKClientBase;
  ethAddress?: string;
  adminAddress: string;
  treasuryAddress: string;
  platformFeePercentage: number;
}

export interface DeploymentResult {
  contractName: string;
  txId: string;
  success: boolean;
  error?: string;
}

/**
 * Content Registry contract source code
 */
const CONTENT_REGISTRY_CONTRACT = `
;; BitStream Content Registry Contract
;; Manages content NFTs and metadata

;; Constants
(define-constant ERR-CONTENT-NOT-FOUND u1001)
(define-constant ERR-NOT-CONTENT-OWNER u1002)
(define-constant ERR-CONTENT-ALREADY-EXISTS u1003)
(define-constant ERR-INVALID-METADATA u1004)
(define-constant ERR-NOT-AUTHORIZED u4001)
(define-constant ERR-INVALID-INPUT u4003)

;; Data Variables
(define-data-var content-id-counter uint u0)

;; Data Maps
(define-map content-registry
  { content-id: uint }
  {
    creator: principal,
    content-hash: (buff 32),
    metadata-uri: (string-ascii 256),
    price: uint,
    created-at: uint,
    updated-at: uint,
    is-active: bool
  }
)

(define-map content-hash-to-id
  { content-hash: (buff 32) }
  { content-id: uint }
)

(define-map creator-content-list
  { creator: principal }
  { content-ids: (list 100 uint) }
)

;; Public Functions
(define-public (register-content (content-hash (buff 32)) (metadata-uri (string-ascii 256)) (price uint))
  (let
    (
      (content-id (+ (var-get content-id-counter) u1))
      (creator tx-sender)
      (current-time (unwrap-panic (get-block-info? time (- block-height u1))))
    )
    ;; Check if content already exists
    (asserts! (is-none (map-get? content-hash-to-id { content-hash: content-hash })) (err ERR-CONTENT-ALREADY-EXISTS))
    
    ;; Validate inputs
    (asserts! (> price u0) (err ERR-INVALID-INPUT))
    (asserts! (> (len metadata-uri) u0) (err ERR-INVALID-METADATA))
    
    ;; Store content information
    (map-set content-registry
      { content-id: content-id }
      {
        creator: creator,
        content-hash: content-hash,
        metadata-uri: metadata-uri,
        price: price,
        created-at: current-time,
        updated-at: current-time,
        is-active: true
      }
    )
    
    ;; Map content hash to ID
    (map-set content-hash-to-id
      { content-hash: content-hash }
      { content-id: content-id }
    )
    
    ;; Update creator's content list
    (let
      (
        (current-list (default-to (list) (get content-ids (map-get? creator-content-list { creator: creator }))))
      )
      (map-set creator-content-list
        { creator: creator }
        { content-ids: (unwrap-panic (as-max-len? (append current-list content-id) u100)) }
      )
    )
    
    ;; Update counter
    (var-set content-id-counter content-id)
    
    ;; Emit event
    (print {
      event: "content-registered",
      content-id: content-id,
      creator: creator,
      price: price,
      metadata-uri: metadata-uri
    })
    
    (ok content-id)
  )
)

(define-public (update-content-metadata (content-id uint) (new-metadata-uri (string-ascii 256)) (new-price uint))
  (let
    (
      (content-info (unwrap! (map-get? content-registry { content-id: content-id }) (err ERR-CONTENT-NOT-FOUND)))
      (current-time (unwrap-panic (get-block-info? time (- block-height u1))))
    )
    ;; Check ownership
    (asserts! (is-eq tx-sender (get creator content-info)) (err ERR-NOT-CONTENT-OWNER))
    
    ;; Validate inputs
    (asserts! (> new-price u0) (err ERR-INVALID-INPUT))
    (asserts! (> (len new-metadata-uri) u0) (err ERR-INVALID-METADATA))
    
    ;; Update content
    (map-set content-registry
      { content-id: content-id }
      (merge content-info {
        metadata-uri: new-metadata-uri,
        price: new-price,
        updated-at: current-time
      })
    )
    
    (ok true)
  )
)

(define-public (transfer-content (content-id uint) (new-owner principal))
  (let
    (
      (content-info (unwrap! (map-get? content-registry { content-id: content-id }) (err ERR-CONTENT-NOT-FOUND)))
    )
    ;; Check ownership
    (asserts! (is-eq tx-sender (get creator content-info)) (err ERR-NOT-CONTENT-OWNER))
    
    ;; Update content owner
    (map-set content-registry
      { content-id: content-id }
      (merge content-info { creator: new-owner })
    )
    
    (ok true)
  )
)

;; Read-only Functions
(define-read-only (get-content-info (content-id uint))
  (map-get? content-registry { content-id: content-id })
)

(define-read-only (get-content-by-hash (content-hash (buff 32)))
  (match (map-get? content-hash-to-id { content-hash: content-hash })
    content-id-info (map-get? content-registry { content-id: (get content-id content-id-info) })
    none
  )
)

(define-read-only (get-creator-content (creator principal))
  (default-to (list) (get content-ids (map-get? creator-content-list { creator: creator })))
)

(define-read-only (get-content-count)
  (var-get content-id-counter)
)

(define-read-only (content-exists (content-hash (buff 32)))
  (is-some (map-get? content-hash-to-id { content-hash: content-hash }))
)
`;

/**
 * Payment Processor contract source code
 */
const PAYMENT_PROCESSOR_CONTRACT = `
;; BitStream Payment Processor Contract
;; Handles STX payments and revenue distribution

;; Constants
(define-constant ERR-INSUFFICIENT-PAYMENT u2001)
(define-constant ERR-PAYMENT-FAILED u2002)
(define-constant ERR-NO-EARNINGS u2003)
(define-constant ERR-WITHDRAWAL-FAILED u2004)
(define-constant ERR-NOT-AUTHORIZED u4001)
(define-constant ERR-CONTRACT-PAUSED u4002)
(define-constant ERR-INVALID-INPUT u4003)

;; Data Variables
(define-data-var platform-treasury uint u0)
(define-data-var platform-fee-percentage uint u1000) ;; 10% in basis points
(define-data-var contract-paused bool false)
(define-data-var admin principal 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Data Maps
(define-map creator-earnings
  { creator: principal }
  { balance: uint }
)

;; Public Functions
(define-public (purchase-content (content-id uint) (payment-amount uint))
  (let
    (
      (content-info (unwrap! (contract-call? .content-registry get-content-info content-id) (err ERR-INVALID-INPUT)))
      (content-price (get price content-info))
      (creator (get creator content-info))
      (platform-fee (get platform-fee-percentage (var-get platform-fee-percentage)))
      (platform-share (/ (* payment-amount platform-fee) u10000))
      (creator-share (- payment-amount platform-share))
    )
    ;; Check if contract is paused
    (asserts! (not (var-get contract-paused)) (err ERR-CONTRACT-PAUSED))
    
    ;; Verify payment amount
    (asserts! (>= payment-amount content-price) (err ERR-INSUFFICIENT-PAYMENT))
    
    ;; Transfer STX from buyer to contract
    (try! (stx-transfer? payment-amount tx-sender (as-contract tx-sender)))
    
    ;; Update creator earnings
    (let
      (
        (current-earnings (default-to u0 (get balance (map-get? creator-earnings { creator: creator }))))
      )
      (map-set creator-earnings
        { creator: creator }
        { balance: (+ current-earnings creator-share) }
      )
    )
    
    ;; Update platform treasury
    (var-set platform-treasury (+ (var-get platform-treasury) platform-share))
    
    ;; Grant access to content
    (try! (contract-call? .access-control grant-access content-id tx-sender))
    
    ;; Emit event
    (print {
      event: "payment-processed",
      content-id: content-id,
      viewer: tx-sender,
      amount: payment-amount,
      creator-share: creator-share,
      platform-share: platform-share
    })
    
    (ok true)
  )
)

(define-public (withdraw-earnings)
  (let
    (
      (earnings-info (unwrap! (map-get? creator-earnings { creator: tx-sender }) (err ERR-NO-EARNINGS)))
      (balance (get balance earnings-info))
    )
    ;; Check if there are earnings to withdraw
    (asserts! (> balance u0) (err ERR-NO-EARNINGS))
    
    ;; Reset creator earnings
    (map-set creator-earnings
      { creator: tx-sender }
      { balance: u0 }
    )
    
    ;; Transfer STX to creator
    (match (as-contract (stx-transfer? balance tx-sender tx-sender))
      success (ok balance)
      error (begin
        ;; Restore earnings on failure
        (map-set creator-earnings
          { creator: tx-sender }
          { balance: balance }
        )
        (err ERR-WITHDRAWAL-FAILED)
      )
    )
  )
)

(define-public (set-platform-fee (new-fee-percentage uint))
  (begin
    ;; Check admin authorization
    (asserts! (is-eq tx-sender (var-get admin)) (err ERR-NOT-AUTHORIZED))
    
    ;; Validate fee percentage (max 100%)
    (asserts! (<= new-fee-percentage u10000) (err ERR-INVALID-INPUT))
    
    ;; Update fee
    (var-set platform-fee-percentage new-fee-percentage)
    
    (ok true)
  )
)

(define-public (pause-contract)
  (begin
    ;; Check admin authorization
    (asserts! (is-eq tx-sender (var-get admin)) (err ERR-NOT-AUTHORIZED))
    
    (var-set contract-paused true)
    (ok true)
  )
)

(define-public (unpause-contract)
  (begin
    ;; Check admin authorization
    (asserts! (is-eq tx-sender (var-get admin)) (err ERR-NOT-AUTHORIZED))
    
    (var-set contract-paused false)
    (ok true)
  )
)

;; Read-only Functions
(define-read-only (get-creator-earnings (creator principal))
  (default-to u0 (get balance (map-get? creator-earnings { creator: creator })))
)

(define-read-only (get-platform-treasury)
  (var-get platform-treasury)
)

(define-read-only (get-platform-fee-percentage)
  (var-get platform-fee-percentage)
)

(define-read-only (is-paused)
  (var-get contract-paused)
)
`;

/**
 * Access Control contract source code
 */
const ACCESS_CONTROL_CONTRACT = `
;; BitStream Access Control Contract
;; Manages content access permissions

;; Constants
(define-constant ERR-ACCESS-DENIED u3001)
(define-constant ERR-ACCESS-ALREADY-GRANTED u3002)
(define-constant ERR-ACCESS-NOT-FOUND u3003)
(define-constant ERR-NOT-AUTHORIZED u4001)
(define-constant ERR-INVALID-INPUT u4003)

;; Data Maps
(define-map content-access
  { content-id: uint, viewer: principal }
  {
    granted-at: uint,
    expires-at: (optional uint),
    is-active: bool
  }
)

(define-map user-content-list
  { viewer: principal }
  { content-ids: (list 100 uint) }
)

;; Public Functions
(define-public (grant-access (content-id uint) (viewer principal))
  (let
    (
      (current-time (unwrap-panic (get-block-info? time (- block-height u1))))
      (access-key { content-id: content-id, viewer: viewer })
    )
    ;; Check if access already exists
    (asserts! (is-none (map-get? content-access access-key)) (err ERR-ACCESS-ALREADY-GRANTED))
    
    ;; Grant access
    (map-set content-access
      access-key
      {
        granted-at: current-time,
        expires-at: none,
        is-active: true
      }
    )
    
    ;; Update user's content list
    (let
      (
        (current-list (default-to (list) (get content-ids (map-get? user-content-list { viewer: viewer }))))
      )
      (map-set user-content-list
        { viewer: viewer }
        { content-ids: (unwrap-panic (as-max-len? (append current-list content-id) u100)) }
      )
    )
    
    ;; Emit event
    (print {
      event: "access-granted",
      content-id: content-id,
      viewer: viewer,
      granted-at: current-time
    })
    
    (ok true)
  )
)

(define-public (revoke-access (content-id uint) (viewer principal))
  (let
    (
      (access-key { content-id: content-id, viewer: viewer })
      (access-info (unwrap! (map-get? content-access access-key) (err ERR-ACCESS-NOT-FOUND)))
      (content-info (unwrap! (contract-call? .content-registry get-content-info content-id) (err ERR-INVALID-INPUT)))
    )
    ;; Check authorization (content owner or admin)
    (asserts! (is-eq tx-sender (get creator content-info)) (err ERR-NOT-AUTHORIZED))
    
    ;; Revoke access
    (map-set content-access
      access-key
      (merge access-info { is-active: false })
    )
    
    (ok true)
  )
)

;; Read-only Functions
(define-read-only (has-access (content-id uint) (viewer principal))
  (match (map-get? content-access { content-id: content-id, viewer: viewer })
    access-info (get is-active access-info)
    false
  )
)

(define-read-only (get-access-info (content-id uint) (viewer principal))
  (map-get? content-access { content-id: content-id, viewer: viewer })
)

(define-read-only (get-user-content-access (viewer principal))
  (default-to (list) (get content-ids (map-get? user-content-list { viewer: viewer })))
)

(define-read-only (batch-check-access (content-ids (list 100 uint)) (viewer principal))
  (map has-access-helper content-ids)
)

(define-private (has-access-helper (content-id uint))
  (has-access content-id tx-sender)
)
`;

/**
 * Deploy a single contract
 */
const deployContract = async (
  config: DeploymentConfig,
  contractName: string,
  contractSource: string
): Promise<DeploymentResult> => {
  try {
    const network = config.network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;
    
    const transaction = await makeContractDeploy({
      contractName,
      codeBody: contractSource,
      senderKey: config.publicKey,
      network,
      postConditionMode: PostConditionMode.Allow,
    });

    const signer = new TransactionSigner(transaction);
    const preSignSigHash = sigHashPreSign(
      signer.sigHash,
      transaction.auth.authType,
      transaction.auth.spendingCondition.fee,
      transaction.auth.spendingCondition.nonce
    );

    const payload = `0x${preSignSigHash}`;
    const signWith = config.ethAddress || config.publicKey;

    const signature = await config.apiClient.signRawPayload({
      encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
      hashFunction: 'HASH_FUNCTION_NO_OP',
      payload,
      signWith,
    });

    const nextSig = `${signature.v}${signature.r.padStart(64, '0')}${signature.s.padStart(64, '0')}`;
    const spendingCondition = transaction.auth.spendingCondition as SingleSigSpendingCondition;
    spendingCondition.signature = createMessageSignature(nextSig);

    const result = await broadcastTransaction({
      network,
      transaction,
    });

    console.log(`✅ ${contractName} deployed successfully: ${result.txid}`);
    
    return {
      contractName,
      txId: result.txid,
      success: true,
    };
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error);
    
    return {
      contractName,
      txId: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Deploy all BitStream contracts in the correct order
 */
export const deployAllContracts = async (
  config: DeploymentConfig
): Promise<DeploymentResult[]> => {
  console.log(`🚀 Starting deployment to ${config.network}...`);
  
  const results: DeploymentResult[] = [];
  
  // Deploy contracts in dependency order
  const contracts = [
    { name: 'content-registry', source: CONTENT_REGISTRY_CONTRACT },
    { name: 'access-control', source: ACCESS_CONTROL_CONTRACT },
    { name: 'payment-processor', source: PAYMENT_PROCESSOR_CONTRACT },
  ];
  
  for (const contract of contracts) {
    console.log(`📦 Deploying ${contract.name}...`);
    
    const result = await deployContract(config, contract.name, contract.source);
    results.push(result);
    
    if (!result.success) {
      console.error(`❌ Deployment failed for ${contract.name}, stopping deployment`);
      break;
    }
    
    // Wait between deployments to avoid nonce issues
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ Deployment complete: ${successCount}/${results.length} contracts deployed successfully`);
  
  return results;
};

/**
 * Wait for transaction confirmation
 */
export const waitForConfirmation = async (
  txId: string,
  network: Network,
  maxRetries: number = 30
): Promise<boolean> => {
  const baseUrl = network === 'testnet' 
    ? 'https://api.testnet.hiro.so/extended/v1'
    : 'https://api.hiro.so/extended/v1';
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${baseUrl}/tx/${txId}`);
      
      if (response.status === 404) {
        // Transaction not found yet, continue waiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.tx_status === 'success') {
        return true;
      } else if (data.tx_status === 'abort_by_response') {
        return false;
      }
      
      // Still pending, continue waiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.warn(`Error checking transaction ${txId}:`, error);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error(`Transaction ${txId} did not confirm within expected time`);
};

/**
 * Generate deployment summary
 */
export const generateDeploymentSummary = (
  results: DeploymentResult[],
  config: DeploymentConfig
): string => {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  let summary = `\n🎯 BitStream Contract Deployment Summary\n`;
  summary += `Network: ${config.network}\n`;
  summary += `Admin Address: ${config.adminAddress}\n`;
  summary += `Treasury Address: ${config.treasuryAddress}\n`;
  summary += `Platform Fee: ${config.platformFeePercentage / 100}%\n\n`;
  
  if (successful.length > 0) {
    summary += `✅ Successfully Deployed (${successful.length}):\n`;
    successful.forEach(result => {
      summary += `  - ${result.contractName}: ${result.txId}\n`;
    });
    summary += '\n';
  }
  
  if (failed.length > 0) {
    summary += `❌ Failed Deployments (${failed.length}):\n`;
    failed.forEach(result => {
      summary += `  - ${result.contractName}: ${result.error}\n`;
    });
    summary += '\n';
  }
  
  if (successful.length === results.length) {
    summary += `🎉 All contracts deployed successfully!\n`;
    summary += `You can now update your frontend configuration with these contract addresses.\n`;
  } else {
    summary += `⚠️  Some deployments failed. Please check the errors above and retry.\n`;
  }
  
  return summary;
};