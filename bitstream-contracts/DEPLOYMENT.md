# BitStream Smart Contracts - Testnet Deployment Guide

## Prerequisites

1. **Node.js and npm**: Ensure you have Node.js 18+ installed
2. **Clarinet**: Stacks smart contract development tool
   - Install: `curl --proto '=https' --tlsv1.2 -sSf https://sh.clarinet.so | sh`
   - Or download from: https://github.com/hirosystems/clarinet/releases

3. **Testnet STX Tokens**: Required for deployment fees (minimum 0.5 STX recommended)
   - Get from faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet

## Quick Deployment

### Option 1: Automated Deployment Script (Recommended)

```bash
# Navigate to contracts directory
cd bitstream-contracts

# Install dependencies
npm install

# Run automated deployment
node deploy-testnet.mjs
```

The script will:
1. Generate a new testnet wallet (or use existing)
2. Display the wallet address for funding
3. Wait for you to fund the wallet
4. Deploy all contracts in correct order
5. Verify deployment and test basic functionality

### Option 2: Manual Deployment

If you prefer manual control or the automated script fails:

#### 1. Configure Wallet

Either let the script generate a wallet, or manually edit `settings/Testnet.toml`:

```toml
[network]
name = "testnet"
stacks_node_rpc_address = "https://api.testnet.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "YOUR_12_OR_24_WORD_MNEMONIC_HERE"
balance = 100000000
```

#### 2. Fund Your Wallet

Visit the testnet faucet and request STX tokens:
- Faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- Request at least 0.5 STX for deployment fees

#### 3. Generate Deployment Plan

```bash
clarinet deployments generate --testnet
```

#### 4. Deploy Contracts

```bash
clarinet deployments apply --testnet
```

#### 5. Verify Deployment

```bash
clarinet deployments check --testnet
```

## Contract Deployment Order

The contracts are deployed in dependency order:

1. **content-registry** (no dependencies)
   - Manages content metadata and ownership
   - Creates unique content IDs and prevents duplicates

2. **access-control** (depends on content-registry)
   - Handles content access permissions
   - Verifies content exists before granting access

3. **payment-processor** (depends on both previous contracts)
   - Processes STX payments and revenue distribution
   - Integrates with access-control to grant permissions

## Deployment Output

After successful deployment, you'll see output similar to:

```
✅ content-registry deployed at: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.content-registry
✅ access-control deployed at: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.access-control
✅ payment-processor deployed at: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-processor
```

**Important**: Save these contract addresses! You'll need them for frontend configuration.

## Testing Deployed Contracts

### Basic Functionality Test

```bash
# Run unit tests (simulated environment)
npm test

# Test specific contract
npm test -- content-registry.test.ts
```

### Manual Testing with Clarinet Console

```bash
# Start interactive console
clarinet console --testnet

# Test content registration
(contract-call? .content-registry register-content 
  0x1234567890abcdef1234567890abcdef12345678 
  "ipfs://QmTest123" 
  u1000000 
  tx-sender)

# Check content info
(contract-call? .content-registry get-content-info u1)
```

## Troubleshooting

### Common Issues

1. **Insufficient STX Balance**
   ```
   Error: Insufficient balance for transaction fees
   ```
   - Solution: Request more STX from the faucet

2. **Network Connection Issues**
   ```
   Error: Failed to connect to Stacks testnet
   ```
   - Solution: Check internet connection and try again
   - Alternative: Use different RPC endpoint in Testnet.toml

3. **Contract Deployment Fails**
   ```
   Error: Contract deployment failed
   ```
   - Solution: Check contract syntax with `clarinet check`
   - Verify wallet has sufficient balance
   - Check for naming conflicts

4. **Deployment Plan Generation Fails**
   ```
   Error: Failed to generate deployment plan
   ```
   - Solution: Ensure Clarinet.toml is properly configured
   - Check contract paths and names

### Debug Commands

```bash
# Check contract syntax
clarinet check

# Validate deployment configuration
clarinet deployments check --testnet

# View deployment history
clarinet deployments list --testnet

# Check wallet balance
clarinet accounts list --testnet
```

## Next Steps

After successful deployment:

1. **Save Contract Addresses**: Copy the deployed contract addresses
2. **Update Frontend Config**: Configure the React app with testnet addresses
3. **Test Integration**: Verify frontend can interact with deployed contracts
4. **Monitor Transactions**: Use Stacks Explorer to monitor contract interactions

## Contract Addresses Configuration

Create a configuration file for your frontend:

```typescript
// config/contracts.testnet.ts
export const TESTNET_CONTRACTS = {
  CONTENT_REGISTRY: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.content-registry',
  ACCESS_CONTROL: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.access-control',
  PAYMENT_PROCESSOR: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-processor',
  NETWORK: 'testnet',
  STACKS_API: 'https://api.testnet.hiro.so'
};
```

## Useful Links

- [Stacks Testnet Explorer](https://explorer.hiro.so/?chain=testnet)
- [Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Stacks.js Documentation](https://stacks.js.org/)