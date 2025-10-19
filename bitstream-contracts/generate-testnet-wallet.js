const { generateSecretKey, getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');

// Generate a new testnet wallet
function generateTestnetWallet() {
    try {
        const secretKey = generateSecretKey();
        const address = getAddressFromPrivateKey(secretKey, TransactionVersion.Testnet);
        
        console.log('🎯 New Testnet Wallet Generated');
        console.log('================================');
        console.log('Address:', address);
        console.log('Private Key:', secretKey);
        console.log('');
        console.log('⚠️  IMPORTANT STEPS:');
        console.log('1. Save this private key securely (testnet only!)');
        console.log('2. Fund this address with testnet STX:');
        console.log('   https://explorer.hiro.so/sandbox/faucet?chain=testnet');
        console.log('3. Update settings/Testnet.toml with this private key');
        console.log('');
        console.log('Testnet.toml configuration:');
        console.log('[accounts.deployer]');
        console.log(`mnemonic = "${secretKey}"`);
        
        return { secretKey, address };
    } catch (error) {
        console.error('Error generating wallet:', error.message);
        console.log('');
        console.log('Alternative: Use an existing testnet wallet mnemonic');
        console.log('You can get one from any Stacks wallet (Hiro Wallet, Xverse, etc.)');
    }
}

if (require.main === module) {
    generateTestnetWallet();
}

module.exports = { generateTestnetWallet };