/**
 * Error handling utilities for BitStream Smart Contracts
 * User-friendly error messages and error recovery strategies
 */

import { ContractError, getErrorMessage } from './types';

export interface BitStreamError extends Error {
  code: ContractError;
  userMessage: string;
  originalError?: Error;
  txId?: string;
  retryable: boolean;
}

/**
 * Create a BitStream error from a contract error
 */
export const createBitStreamError = (
  code: ContractError,
  originalError?: Error,
  txId?: string
): BitStreamError => {
  const userMessage = getErrorMessage(code);
  const error = new Error(userMessage) as BitStreamError;
  
  error.code = code;
  error.userMessage = userMessage;
  error.originalError = originalError;
  error.txId = txId;
  error.retryable = isRetryableError(code);
  
  return error;
};

/**
 * Check if an error is retryable
 */
export const isRetryableError = (code: ContractError): boolean => {
  const retryableErrors = [
    ContractError.PAYMENT_FAILED,
    ContractError.WITHDRAWAL_FAILED,
    ContractError.INVALID_INPUT, // Sometimes input validation can be retried with corrected data
  ];
  
  return retryableErrors.includes(code);
};

/**
 * Parse error from transaction result
 */
export const parseTransactionError = (error: any, txId?: string): BitStreamError => {
  // Try to extract error code from various error formats
  let errorCode = ContractError.INVALID_INPUT;
  let originalMessage = '';

  if (error instanceof Error) {
    originalMessage = error.message;
  } else if (typeof error === 'string') {
    originalMessage = error;
  } else if (error && typeof error === 'object') {
    originalMessage = error.message || error.error || JSON.stringify(error);
  }

  // Try to extract specific error codes from the message
  if (originalMessage.includes('insufficient-payment') || originalMessage.includes('2001')) {
    errorCode = ContractError.INSUFFICIENT_PAYMENT;
  } else if (originalMessage.includes('payment-failed') || originalMessage.includes('2002')) {
    errorCode = ContractError.PAYMENT_FAILED;
  } else if (originalMessage.includes('no-earnings') || originalMessage.includes('2003')) {
    errorCode = ContractError.NO_EARNINGS;
  } else if (originalMessage.includes('withdrawal-failed') || originalMessage.includes('2004')) {
    errorCode = ContractError.WITHDRAWAL_FAILED;
  } else if (originalMessage.includes('content-not-found') || originalMessage.includes('1001')) {
    errorCode = ContractError.CONTENT_NOT_FOUND;
  } else if (originalMessage.includes('not-content-owner') || originalMessage.includes('1002')) {
    errorCode = ContractError.NOT_CONTENT_OWNER;
  } else if (originalMessage.includes('content-already-exists') || originalMessage.includes('1003')) {
    errorCode = ContractError.CONTENT_ALREADY_EXISTS;
  } else if (originalMessage.includes('invalid-metadata') || originalMessage.includes('1004')) {
    errorCode = ContractError.INVALID_METADATA;
  } else if (originalMessage.includes('access-denied') || originalMessage.includes('3001')) {
    errorCode = ContractError.ACCESS_DENIED;
  } else if (originalMessage.includes('access-already-granted') || originalMessage.includes('3002')) {
    errorCode = ContractError.ACCESS_ALREADY_GRANTED;
  } else if (originalMessage.includes('access-not-found') || originalMessage.includes('3003')) {
    errorCode = ContractError.ACCESS_NOT_FOUND;
  } else if (originalMessage.includes('not-authorized') || originalMessage.includes('4001')) {
    errorCode = ContractError.NOT_AUTHORIZED;
  } else if (originalMessage.includes('contract-paused') || originalMessage.includes('4002')) {
    errorCode = ContractError.CONTRACT_PAUSED;
  }

  return createBitStreamError(errorCode, error instanceof Error ? error : new Error(originalMessage), txId);
};

/**
 * Error recovery suggestions based on error type
 */
export const getErrorRecoveryAction = (error: BitStreamError): string => {
  switch (error.code) {
    case ContractError.INSUFFICIENT_PAYMENT:
      return 'Please check the content price and ensure you have enough STX tokens.';
    
    case ContractError.PAYMENT_FAILED:
      return 'Payment processing failed. Please try again or check your wallet connection.';
    
    case ContractError.NO_EARNINGS:
      return 'You have no earnings to withdraw at this time.';
    
    case ContractError.WITHDRAWAL_FAILED:
      return 'Withdrawal failed. Please try again later or contact support.';
    
    case ContractError.CONTENT_NOT_FOUND:
      return 'The requested content could not be found. It may have been removed or the ID is incorrect.';
    
    case ContractError.NOT_CONTENT_OWNER:
      return 'You are not the owner of this content and cannot perform this action.';
    
    case ContractError.CONTENT_ALREADY_EXISTS:
      return 'Content with this hash already exists. Please check for duplicates.';
    
    case ContractError.INVALID_METADATA:
      return 'The metadata provided is invalid. Please check the format and try again.';
    
    case ContractError.ACCESS_DENIED:
      return 'You do not have permission to access this content. Please purchase access first.';
    
    case ContractError.ACCESS_ALREADY_GRANTED:
      return 'Access has already been granted to this content.';
    
    case ContractError.ACCESS_NOT_FOUND:
      return 'No access record found for this content and user combination.';
    
    case ContractError.NOT_AUTHORIZED:
      return 'You are not authorized to perform this action. Admin privileges may be required.';
    
    case ContractError.CONTRACT_PAUSED:
      return 'The contract is currently paused for maintenance. Please try again later.';
    
    case ContractError.INVALID_INPUT:
      return 'Invalid input provided. Please check your data and try again.';
    
    default:
      return 'An unexpected error occurred. Please try again or contact support.';
  }
};

/**
 * Format error for display to users
 */
export const formatErrorForUser = (error: BitStreamError): {
  title: string;
  message: string;
  action: string;
  canRetry: boolean;
} => {
  return {
    title: getErrorTitle(error.code),
    message: error.userMessage,
    action: getErrorRecoveryAction(error),
    canRetry: error.retryable,
  };
};

/**
 * Get error title for UI display
 */
const getErrorTitle = (code: ContractError): string => {
  switch (code) {
    case ContractError.INSUFFICIENT_PAYMENT:
    case ContractError.PAYMENT_FAILED:
      return 'Payment Error';
    
    case ContractError.NO_EARNINGS:
    case ContractError.WITHDRAWAL_FAILED:
      return 'Withdrawal Error';
    
    case ContractError.CONTENT_NOT_FOUND:
    case ContractError.NOT_CONTENT_OWNER:
    case ContractError.CONTENT_ALREADY_EXISTS:
    case ContractError.INVALID_METADATA:
      return 'Content Error';
    
    case ContractError.ACCESS_DENIED:
    case ContractError.ACCESS_ALREADY_GRANTED:
    case ContractError.ACCESS_NOT_FOUND:
      return 'Access Error';
    
    case ContractError.NOT_AUTHORIZED:
      return 'Authorization Error';
    
    case ContractError.CONTRACT_PAUSED:
      return 'Service Unavailable';
    
    case ContractError.INVALID_INPUT:
      return 'Input Error';
    
    default:
      return 'Error';
  }
};

/**
 * Log error for debugging and monitoring
 */
export const logError = (error: BitStreamError, context?: string): void => {
  const logData = {
    code: error.code,
    message: error.message,
    userMessage: error.userMessage,
    txId: error.txId,
    context,
    timestamp: new Date().toISOString(),
    originalError: error.originalError?.message,
    stack: error.stack,
  };

  console.error('BitStream Contract Error:', logData);

  // In a production environment, you might want to send this to a logging service
  // Example: sendToLoggingService(logData);
};

/**
 * Retry wrapper for contract operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if it's not a retryable error
      if (error instanceof Error && 'code' in error) {
        const bitStreamError = error as BitStreamError;
        if (!bitStreamError.retryable) {
          throw error;
        }
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError!;
};