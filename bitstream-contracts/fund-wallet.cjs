const { execSync } = require('child_process');

const WALLET_ADDRESS = 'SP3ZPR5HD142D10GJ89CFHZMAWH8YHZBTQK2BA91D';

async function checkBalance() {
    try {
        const result = execSync(`stx balance ${WALLET_ADDRESS}`, { encoding: 'utf8' });
        const balanceInfo = JSON.parse(result);
        const stxBalance = parseInt(balanceInfo.balance) / 1000000;
        
        console.log('💰 Current Wallet Balance:');
        console.log(`   Address: ${WALLET_ADDRESS}`);
        console.log(`   STX Balance: ${stxBalance} STX`);
        console.log(`   Raw Balance: ${balanceInfo.balance} microSTX`);
        
        return stxBalance;
    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
        return 0;
    }
}

async function requestFaucetFunds() {
    console.log('\n🚰 Funding Instructions:');
    console.log('========================');
    console.log('1. Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet');
    console.log(`2. Enter address: ${WALLET_ADDRESS}`);
    console.log('3. Click "Request STX" button');
    console.log('4. Wait for transaction confirmation (usually 1-2 minutes)');
    console.log('5. Run this script again to check balance');
    console.log('\n💡 Alternative faucets:');
    console.log('   - https://faucet.stacks.co/');
    console.log('   - https://testnet.stacks.co/faucet');
}

async function main() {
    console.log('🎯 BitStream Wallet Funding Check');
    console.log('==================================');
    
    const balance = await checkBalance();
    
    if (balance >= 0.5) {
        console.log('\n✅ Wallet has sufficient balance for deployment!');
        console.log('   You can now run: node deploy-with-stx-cli.cjs');
    } else {
        console.log('\n⚠️  Wallet needs funding for deployment');
        console.log(`   Current: ${balance} STX`);
        console.log('   Required: ~0.5 STX (for deployment fees)');
        
        await requestFaucetFunds();
    }
}

main().catch(console.error);