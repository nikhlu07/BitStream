/**
 * Simplified Turnkey Integration - Following stacks_craftPay Pattern
 */

import { TurnkeyProvider } from '@turnkey/react-wallet-kit';

export interface TurnkeyConfig {
  apiBaseUrl: string;
  organizationId: string;
  authProxyConfigId: string;
}

export const getTurnkeyConfig = (): TurnkeyConfig => {
  const apiBaseUrl = import.meta.env.VITE_TURNKEY_API_BASE_URL || 'https://api.turnkey.com';
  const organizationId = import.meta.env.VITE_TURNKEY_ORGANIZATION_ID || '';
  const authProxyConfigId = import.meta.env.VITE_TURNKEY_AUTH_PROXY_CONFIG_ID || '';

  if (!organizationId) {
    throw new Error('VITE_TURNKEY_ORGANIZATION_ID is required');
  }

  if (!authProxyConfigId) {
    throw new Error('VITE_TURNKEY_AUTH_PROXY_CONFIG_ID is required');
  }

  return {
    apiBaseUrl,
    organizationId,
    authProxyConfigId,
  };
};

export const createTurnkeyConfig = () => {
  const config = getTurnkeyConfig();
  
  return {
    apiBaseUrl: config.apiBaseUrl,
    organizationId: config.organizationId,
    authProxyConfigId: config.authProxyConfigId,
  };
};