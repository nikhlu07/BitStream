/**
 * BitStream Smart Contracts Integration
 * Main entry point for all contract interactions
 */

// Export all types
export * from './types';

// Export contract interfaces
export * from './contentRegistry';
export * from './paymentProcessor';
export * from './accessControl';

// Export utilities
export * from './utils';
export * from './events';
export * from './errors';

// Re-export commonly used functions for convenience
export {
  // Content Registry
  registerContent,
  updateContentMetadata,
  transferContent,
  getContentInfo,
  getContentByHash,
  getCreatorContent,
  getContentCount,
  contentExists,
} from './contentRegistry';

export {
  // Payment Processor
  purchaseContent,
  withdrawEarnings,
  getCreatorEarnings,
  getPlatformTreasury,
  getPlatformFeePercentage,
  setPlatformFee,
  pauseContract,
  unpauseContract,
  isContractPaused,
  calculateRevenueSplit,
} from './paymentProcessor';

export {
  // Access Control
  grantAccess,
  revokeAccess,
  hasAccess,
  getAccessInfo,
  getUserContentAccess,
  getContentViewers,
  transferAccess,
  setAccessExpiration,
  batchCheckAccess,
} from './accessControl';

export {
  // Events
  fetchContractEvents,
  parseContentRegisteredEvent,
  parsePaymentEvent,
  parseAccessGrantedEvent,
  createEventListener,
  waitForEvent,
  ContractEventListener,
} from './events';

export {
  // Errors
  createBitStreamError,
  parseTransactionError,
  getErrorRecoveryAction,
  formatErrorForUser,
  logError,
  withRetry,
  type BitStreamError,
} from './errors';

export {
  // Utils
  getNetwork,
  getContractAddresses,
  signAndBroadcastTransaction,
  callReadOnlyFunction,
  parseContentInfo,
  parseCreatorEarnings,
  parseContentAccess,
  parseContentIdList,
  generateContentHash,
  formatSTX,
  parseSTX,
  validateMetadataUri,
  validateContentPrice,
  validatePrincipal,
} from './utils';