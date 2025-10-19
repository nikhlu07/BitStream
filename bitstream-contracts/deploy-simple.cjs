const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const PRIVATE_KEY = '57e8bffccf4e90aac37b9e33885a7b4ab1b70e22b2896fdd00eb2691b9d0a24701';
const WALLET_ADDRESS = 'SP2AJZZ6JAGEXV7SX056F9EZFABTX64CM2CQTPCCX';

// Contract deployment order
const CONTRACTS = [
    { name: 'content-registry', path: 'contracts/content-registry.clar' },
    { name: 'access-control', path: 'contracts/access-control.clar' },
    { name: 'payment-processor', path: 'contracts/payment-processor.clar' }
];

async function deployContract(contractName, contractPath) {
    console.log(`\n🚀 Deploying ${contractName}...`);
    
    try {
        // Use stx deploy_contract command (no --testnet flag needed, it uses the network from the private key)
        const command = `stx deploy_contract "${contractPath}" "${contractName}" 50000 0 "${PRIVATE_KEY}"`;
        
        console.log(`⚡ Deploying ${contractName}...`);
        
        const result = execSync(command, { 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        console.log(`✅ ${contractName} deployed successfully!`);
        console.log(`📋 Transaction: ${result.trim()}`);
        
        return { success: true, txId: result.trim() };
        
    } catch (error) {
        console.error(`❌ Failed to deploy ${contractName}:`);
        console.error(`Error: ${error.message}`);
        if (error.stdout) console.error(`Stdout: ${error.stdout}`);
        if (error.stderr) console.error(`Stderr: ${error.stderr}`);
        
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('🎯 BitStream Smart Contracts - Testnet Deployment');
    console.log('================================================');
    console.log(`🏠 Deployer Address: ${WALLET_ADDRESS}`);
    
    // Check wallet balance
    try {
        const balanceCmd = `stx balance ${WALLET_ADDRESS}`;
        const balanceResult = execSync(balanceCmd, { encoding: 'utf8' });
        console.log(`💰 Wallet Balance: ${balanceResult.trim()}`);
    } catch (error) {
        console.warn(`⚠️  Could not check balance: ${error.message}`);
    }
    
    console.log('\n📋 Deploying contracts in dependency order...');
    
    const results = [];
    
    for (const contract of CONTRACTS) {
        const result = await deployContract(contract.name, contract.path);
        results.push({ ...contract, ...result });
        
        if (!result.success) {
            console.error(`💥 Deployment failed at ${contract.name}. Stopping.`);
            break;
        }
        
        // Wait between deployments
        console.log('⏱️  Waiting 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Summary
    console.log('\n📊 Deployment Summary:');
    console.log('======================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (successful.length > 0) {
        console.log('\n🎉 Successfully deployed contracts:');
        successful.forEach(contract => {
            console.log(`  • ${contract.name}: ${WALLET_ADDRESS}.${contract.name}`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n💥 Failed deployments:');
        failed.forEach(contract => {
            console.log(`  • ${contract.name}: ${contract.error}`);
        });
    }
    
    // Save results
    const deploymentInfo = {
        timestamp: new Date().toISOString(),
        network: 'testnet',
        deployer: WALLET_ADDRESS,
        contracts: results
    };
    
    fs.writeFileSync('deployment-results.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('\n💾 Results saved to deployment-results.json');
    
    if (successful.length === CONTRACTS.length) {
        console.log('\n🎊 All contracts deployed successfully!');
        console.log('\n📝 Contract addresses for frontend:');
        successful.forEach(contract => {
            console.log(`${contract.name.toUpperCase()}: '${WALLET_ADDRESS}.${contract.name}'`);
        });
    }
}

main().catch(error => {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
});