/**
 * Turnkey Configuration
 * Manages Turnkey SDK configuration and settings
 */

export interface TurnkeyConfig {
  apiBaseUrl: string;
  organizationId: string;
  rpId: string;
}

export const getTurnkeyConfig = (): TurnkeyConfig => {
  const apiBaseUrl = import.meta.env.VITE_TURNKEY_API_BASE_URL || 'https://api.turnkey.com';
  const organizationId = import.meta.env.VITE_TURNKEY_ORGANIZATION_ID || '';
  const rpId = import.meta.env.VITE_TURNKEY_RP_ID || window.location.hostname;

  return {
    apiBaseUrl,
    organizationId,
    rpId,
  };
};

export const isDemoMode = (): boolean => {
  // Demo mode is enabled only when explicitly set to 'true'.
  // This ensures we attempt real SDK flows by default when env is not provided.
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

export const isFaucetEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_FAUCET === 'true';
};

export const validateTurnkeyConfig = (): { valid: boolean; errors: string[] } => {
  const config = getTurnkeyConfig();
  const errors: string[] = [];

  if (!config.apiBaseUrl) {
    errors.push('VITE_TURNKEY_API_BASE_URL is not configured');
  }

  if (!config.organizationId && !isDemoMode()) {
    errors.push('VITE_TURNKEY_ORGANIZATION_ID is required for production mode');
  }

  if (!config.rpId) {
    errors.push('VITE_TURNKEY_RP_ID is not configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
