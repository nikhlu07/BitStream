/**
 * Contract Integration Test Script
 * Tests the deployed smart contracts from the command line
 */

import { 
  getContentCount, 
  getPlatformTreasury, 
  isContractPaused,
  hasAccess,
  getCreatorEarnings
} from '../lib/contracts';
import { getCurrentConfig, validateConfig } from '../lib/contracts/config';
import { getCurrentNetwork } from '../lib/contracts/utils';

async function testContractIntegration() {
  console.log('🎯 BitStream Contract Integration Test');
  console.log('=====================================');
  
  const network = getCurrentNetwork();
  const config = getCurrentConfig();
  
  console.log(`🌐 Network: ${network}`);
  console.log(`📍 Contract Addresses:`);
  console.log(`  Content Registry: ${config.addresses.contentRegistry}`);
  console.log(`  Access Control: ${config.addresses.accessControl}`);
  console.log(`  Payment Processor: ${config.addresses.paymentProcessor}`);
  
  // Validate configuration
  const isValid = validateConfig(config);
  console.log(`✅ Configuration Valid: ${isValid}`);
  
  if (!isValid) {
    console.error('❌ Invalid configuration. Exiting.');
    return false;
  }
  
  const results: Record<string, boolean> = {};
  const errors: string[] = [];
  
  // Test Content Registry
  console.log('\n📚 Testing Content Registry...');
  try {
    const contentCount = await getContentCount();
    console.log(`  Content Count: ${contentCount}`);
    results.contentRegistry = true;
  } catch (error) {
    console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    results.contentRegistry = false;
    errors.push(`Content Registry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test Payment Processor
  console.log('\n💰 Testing Payment Processor...');
  try {
    const treasury = await getPlatformTreasury();
    const isPaused = await isContractPaused();
    console.log(`  Platform Treasury: ${treasury} microSTX`);
    console.log(`  Contract Paused: ${isPaused}`);
    results.paymentProcessor = true;
  } catch (error) {
    console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    results.paymentProcessor = false;
    errors.push(`Payment Processor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test Access Control
  console.log('\n🔐 Testing Access Control...');
  try {
    const testAddress = config.adminAddress;
    const access = await hasAccess(1, testAddress);
    console.log(`  Access Check (Content ID 1, ${testAddress}): ${access}`);
    results.accessControl = true;
  } catch (error) {
    console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    results.accessControl = false;
    errors.push(`Access Control: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test Creator Earnings
  console.log('\n💸 Testing Creator Earnings...');
  try {
    const earnings = await getCreatorEarnings(config.adminAddress);
    console.log(`  Creator Earnings (${config.adminAddress}): ${earnings} microSTX`);
    results.creatorEarnings = true;
  } catch (error) {
    console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    results.creatorEarnings = false;
    errors.push(`Creator Earnings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  
  const successful = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (errors.length > 0) {
    console.log('\n💥 Errors:');
    errors.forEach(error => console.log(`  • ${error}`));
  }
  
  const allSuccessful = successful === total;
  
  if (allSuccessful) {
    console.log('\n🎉 All tests passed! Frontend is ready for testnet integration.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the contract deployment and network configuration.');
  }
  
  return allSuccessful;
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testContractIntegration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test script failed:', error);
      process.exit(1);
    });
}

export { testContractIntegration };