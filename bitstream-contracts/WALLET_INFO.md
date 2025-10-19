# Testnet Wallet Information

## Generated Wallet for Deployment

**Address:** `SP3ZPR5HD142D10GJ89CFHZMAWH8YHZBTQK2BA91D`

**Private Key:** `69cdbbb8b2424a0a993cf2442cdf4d93e9edfa130a529fcbc8a5d671732d85ac01`

**Mnemonic:** `perfect clarify potato cherry account solve brother six project resemble plate welcome stuff muscle multiply squirrel brisk carry girl cabin satisfy connect race adjust`

## Funding Instructions

1. Visit the Stacks Testnet Faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Enter the address: `SP3ZPR5HD142D10GJ89CFHZMAWH8YHZBTQK2BA91D`
3. Request testnet STX tokens (minimum 0.5 STX recommended for deployment)
4. Wait for the transaction to confirm

## Current Balance

```json
{
  "balance": "0",
  "locked": "0", 
  "unlock_height": 0,
  "nonce": 0
}
```

## Next Steps

After funding the wallet:
1. Run `node deploy-with-stx-cli.cjs` to deploy contracts
2. The deployment will proceed automatically in the correct order
3. Contract addresses will be saved to `deployment-results.json`

## Security Note

⚠️ **This is a testnet-only wallet. Do not use these keys for mainnet or store real funds!**