/**
 * Network Configuration
 * Manages network-specific settings for Stacks blockchain
 */

export type NetworkType = 'testnet' | 'mainnet';

export interface NetworkConfig {
  stacksApi: string;
  explorerUrl: string;
  sbtcContract: string;
}

export const networkConfig: Record<NetworkType, NetworkConfig> = {
  testnet: {
    stacksApi: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so/?chain=testnet',
    sbtcContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token',
  },
  mainnet: {
    stacksApi: 'https://api.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    sbtcContract: 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.sbtc-token',
  },
};

export const getCurrentNetwork = (): NetworkType => {
  const network = import.meta.env.VITE_STACKS_NETWORK || 'testnet';
  return network as NetworkType;
};

export const getNetworkConfig = (): NetworkConfig => {
  return networkConfig[getCurrentNetwork()];
};

export const isTestnet = (): boolean => {
  return getCurrentNetwork() === 'testnet';
};

export const isMainnet = (): boolean => {
  return getCurrentNetwork() === 'mainnet';
};
