const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TESTNET_API = 'https://api.testnet.hiro.so';
const PRIVATE_KEY = 'shuffle pluck action dynamic ecology february absorb legal steak cluster expose ride myth ugly pull cabin width hybrid furnace attack enemy please hobby';

// Contract deployment order (based on dependencies)
const CONTRACTS = [
    {
        name: 'content-registry',
        path: 'contracts/content-registry.clar',
        description: 'Manages content metadata and ownership'
    },
    {
        name: 'access-control', 
        path: 'contracts/access-control.clar',
        description: 'Handles content access permissions'
    },
    {
        name: 'payment-processor',
        path: 'contracts/payment-processor.clar', 
        description: 'Processes payments and revenue distribution'
    }
];

async function deployContract(contractName, contractPath, description) {
    console.log(`\n🚀 Deploying ${contractName}...`);
    console.log(`📄 Description: ${description}`);
    console.log(`📁 Path: ${contractPath}`);
    
    try {
        // Deploy contract using Stacks CLI
        // Format: deploy_contract SOURCE_FILE CONTRACT_NAME FEE NONCE PAYMENT_KEY
        const fee = 50000; // 0.05 STX in microSTX
        const nonce = 0; // Will be auto-incremented by the network
        const command = `stx deploy_contract "${contractPath}" "${contractName}" ${fee} ${nonce} "${PRIVATE_KEY}"`;
        
        console.log(`⚡ Executing: ${command.replace(PRIVATE_KEY, '[PRIVATE_KEY_HIDDEN]')}`);
        
        const result = execSync(command, { 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        console.log(`✅ ${contractName} deployed successfully!`);
        console.log(`📋 Result: ${result.trim()}`);
        
        return { success: true, result: result.trim() };
        
    } catch (error) {
        console.error(`❌ Failed to deploy ${contractName}:`);
        console.error(`Error: ${error.message}`);
        console.error(`Output: ${error.stdout || 'No stdout'}`);
        console.error(`Stderr: ${error.stderr || 'No stderr'}`);
        
        return { success: false, error: error.message };
    }
}

async function checkWalletBalance(address) {
    console.log('\n💰 Checking wallet balance...');
    
    try {
        const command = `stx balance ${address} --testnet`;
        const result = execSync(command, { encoding: 'utf8' });
        
        const balanceInfo = JSON.parse(result);
        const stxBalance = parseInt(balanceInfo.balance) / 1000000; // Convert microSTX to STX
        
        console.log(`💳 Wallet balance: ${stxBalance} STX`);
        console.log(`📊 Full balance info: ${result.trim()}`);
        
        return { stxBalance, balanceInfo };
        
    } catch (error) {
        console.warn(`⚠️  Could not check balance: ${error.message}`);
        return null;
    }
}

async function getWalletAddress() {
    console.log('\n📍 Getting wallet address...');
    
    try {
        const command = `stx get_address "${PRIVATE_KEY}"`;
        const result = execSync(command, { encoding: 'utf8' });
        const addressInfo = JSON.parse(result);
        const address = addressInfo.STACKS;
        
        console.log(`🏠 Wallet address: ${address}`);
        return address;
        
    } catch (error) {
        console.warn(`⚠️  Could not get address: ${error.message}`);
        // Fallback to hardcoded address
        console.log(`🏠 Using fallback address: ${WALLET_ADDRESS}`);
        return WALLET_ADDRESS;
    }
}

async function main() {
    console.log('🎯 BitStream Smart Contracts - Testnet Deployment');
    console.log('================================================');
    console.log(`🌐 Network: Stacks Testnet`);
    console.log(`🔗 API: ${TESTNET_API}`);
    
    // Get wallet info
    const address = await getWalletAddress();
    const balance = await checkWalletBalance(address);
    
    if (!address) {
        console.error('❌ Could not get wallet address. Please check your mnemonic.');
        process.exit(1);
    }
    
    console.log('\n📋 Deployment Plan:');
    CONTRACTS.forEach((contract, index) => {
        console.log(`${index + 1}. ${contract.name} - ${contract.description}`);
    });
    
    console.log('\n⏳ Starting deployment process...');
    
    const deploymentResults = [];
    
    // Deploy contracts in order
    for (const contract of CONTRACTS) {
        const result = await deployContract(contract.name, contract.path, contract.description);
        deploymentResults.push({
            ...contract,
            ...result
        });
        
        if (!result.success) {
            console.error(`💥 Deployment failed at ${contract.name}. Stopping deployment.`);
            break;
        }
        
        // Wait a bit between deployments
        console.log('⏱️  Waiting 5 seconds before next deployment...');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Summary
    console.log('\n📊 Deployment Summary:');
    console.log('======================');
    
    const successful = deploymentResults.filter(r => r.success);
    const failed = deploymentResults.filter(r => !r.success);
    
    console.log(`✅ Successful deployments: ${successful.length}`);
    console.log(`❌ Failed deployments: ${failed.length}`);
    
    if (successful.length > 0) {
        console.log('\n🎉 Successfully deployed contracts:');
        successful.forEach(contract => {
            console.log(`  • ${contract.name}`);
        });
        
        console.log(`\n📍 Contract addresses (use format: ${address}.contract-name):`);
        successful.forEach(contract => {
            console.log(`  • ${contract.name}: ${address}.${contract.name}`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n💥 Failed deployments:');
        failed.forEach(contract => {
            console.log(`  • ${contract.name}: ${contract.error}`);
        });
    }
    
    // Save deployment info
    const deploymentInfo = {
        timestamp: new Date().toISOString(),
        network: 'testnet',
        deployer: address,
        contracts: deploymentResults,
        successful: successful.length,
        failed: failed.length
    };
    
    fs.writeFileSync('deployment-results.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('\n💾 Deployment results saved to deployment-results.json');
    
    if (successful.length === CONTRACTS.length) {
        console.log('\n🎊 All contracts deployed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Update frontend configuration with contract addresses');
        console.log('2. Test contract interactions');
        console.log('3. Verify contracts on Stacks Explorer');
        console.log(`   Explorer: https://explorer.hiro.so/?chain=testnet`);
    } else {
        console.log('\n⚠️  Some deployments failed. Please check the errors above.');
        process.exit(1);
    }
}

// Run deployment
main().catch(error => {
    console.error('💥 Deployment script failed:', error);
    process.exit(1);
});