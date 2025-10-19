const { generateSecretKey, getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const fs = require('fs');
const path = require('path');

// Generate a new testnet wallet for deployment
function generateTestnetWallet() {
    const secretKey = generateSecretKey();
    const address = getAddressFromPrivateKey(secretKey, TransactionVersion.Testnet);
    
    console.log('Generated Testnet Wallet:');
    console.log('Address:', address);
    console.log('Private Key:', secretKey);
    console.log('');
    console.log('Please fund this address with testnet STX tokens from the faucet:');
    console.log('https://explorer.hiro.so/sandbox/faucet?chain=testnet');
    console.log('');
    
    return { secretKey, address };
}

// Update Testnet.toml with the generated wallet
function updateTestnetConfig(secretKey) {
    const testnetConfigPath = path.join(__dirname, 'settings', 'Testnet.toml');
    
    const config = `[network]
name = "testnet"
stacks_node_rpc_address = "https://api.testnet.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "${secretKey}"
balance = 100000000

`;

    fs.writeFileSync(testnetConfigPath, config);
    console.log('Updated Testnet.toml with deployment wallet');
}

// Main deployment function
async function deployToTestnet() {
    console.log('BitStream Smart Contracts - Testnet Deployment');
    console.log('==============================================');
    
    // Generate wallet
    const { secretKey, address } = generateTestnetWallet();
    
    // Update config
    updateTestnetConfig(secretKey);
    
    console.log('Next steps:');
    console.log('1. Fund the address above with testnet STX');
    console.log('2. Run: clarinet deployments generate --testnet');
    console.log('3. Run: clarinet deployments apply --testnet');
    console.log('');
    console.log('Contract deployment order will be:');
    console.log('1. content-registry');
    console.log('2. access-control');
    console.log('3. payment-processor');
}

if (require.main === module) {
    deployToTestnet().catch(console.error);
}

module.exports = { deployToTestnet, generateTestnetWallet, updateTestnetConfig };