// Mock Turnkey wallet hook for when Turnkey is disabled
export const useTurnkeyWallet = () => {
  return {
    connectTurnkey: async () => {
      console.log('Mock Turnkey connection');
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    address: null,
    isLoading: false,
    isConnected: false,
  };
};