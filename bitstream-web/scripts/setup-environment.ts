/**
 * Environment setup script for BitStream Smart Contracts
 * Configures environment variables and validates setup
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { type Network, type ContractConfig } from '../src/lib/contracts/config';

export interface EnvironmentSetup {
  network: Network;
  contractAddresses: {
    contentRegistry: string;
    paymentProcessor: string;
    accessControl: string;
  };
  adminAddress: string;
  treasuryAddress: string;
  platformFeePercentage: number;
}

/**
 * Generate environment file content
 */
export const generateEnvFile = (setup: EnvironmentSetup): string => {
  return `# BitStream Smart Contracts Configuration
# Generated on ${new Date().toISOString()}

# Network Configuration
VITE_STACKS_NETWORK=${setup.network}

# Contract Addresses
VITE_CONTENT_REGISTRY_ADDRESS=${setup.contractAddresses.contentRegistry}
VITE_PAYMENT_PROCESSOR_ADDRESS=${setup.contractAddresses.paymentProcessor}
VITE_ACCESS_CONTROL_ADDRESS=${setup.contractAddresses.accessControl}

# Admin Configuration
VITE_ADMIN_ADDRESS=${setup.adminAddress}
VITE_TREASURY_ADDRESS=${setup.treasuryAddress}
VITE_PLATFORM_FEE_PERCENTAGE=${setup.platformFeePercentage}

# API Configuration
VITE_STACKS_API_URL=${setup.network === 'testnet' 
  ? 'https://api.testnet.hiro.so' 
  : 'https://api.hiro.so'}

# Frontend Configuration
VITE_APP_NAME=BitStream
VITE_APP_DESCRIPTION=Decentralized Content Monetization Platform
VITE_APP_VERSION=1.0.0
`;
};

/**
 * Create environment file for specific network
 */
export const createEnvironmentFile = (
  setup: EnvironmentSetup,
  outputPath?: string
): string => {
  const envContent = generateEnvFile(setup);
  const filePath = outputPath || join(process.cwd(), `.env.${setup.network}`);
  
  try {
    writeFileSync(filePath, envContent, 'utf8');
    console.log(`✅ Environment file created: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`❌ Failed to create environment file: ${error}`);
    throw error;
  }
};

/**
 * Update existing environment file
 */
export const updateEnvironmentFile = (
  filePath: string,
  updates: Partial<EnvironmentSetup>
): void => {
  try {
    let content = '';
    
    if (existsSync(filePath)) {
      content = readFileSync(filePath, 'utf8');
    }
    
    // Parse existing content
    const lines = content.split('\n');
    const envVars = new Map<string, string>();
    
    // Extract existing variables
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars.set(key.trim(), valueParts.join('=').trim());
        }
      }
    });
    
    // Apply updates
    if (updates.network) {
      envVars.set('VITE_STACKS_NETWORK', updates.network);
      envVars.set('VITE_STACKS_API_URL', 
        updates.network === 'testnet' 
          ? 'https://api.testnet.hiro.so' 
          : 'https://api.hiro.so'
      );
    }
    
    if (updates.contractAddresses) {
      if (updates.contractAddresses.contentRegistry) {
        envVars.set('VITE_CONTENT_REGISTRY_ADDRESS', updates.contractAddresses.contentRegistry);
      }
      if (updates.contractAddresses.paymentProcessor) {
        envVars.set('VITE_PAYMENT_PROCESSOR_ADDRESS', updates.contractAddresses.paymentProcessor);
      }
      if (updates.contractAddresses.accessControl) {
        envVars.set('VITE_ACCESS_CONTROL_ADDRESS', updates.contractAddresses.accessControl);
      }
    }
    
    if (updates.adminAddress) {
      envVars.set('VITE_ADMIN_ADDRESS', updates.adminAddress);
    }
    
    if (updates.treasuryAddress) {
      envVars.set('VITE_TREASURY_ADDRESS', updates.treasuryAddress);
    }
    
    if (updates.platformFeePercentage !== undefined) {
      envVars.set('VITE_PLATFORM_FEE_PERCENTAGE', updates.platformFeePercentage.toString());
    }
    
    // Generate updated content
    const updatedContent = generateEnvFileFromMap(envVars);
    writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`✅ Environment file updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Failed to update environment file: ${error}`);
    throw error;
  }
};

/**
 * Generate environment file content from Map
 */
const generateEnvFileFromMap = (envVars: Map<string, string>): string => {
  let content = `# BitStream Smart Contracts Configuration\n`;
  content += `# Updated on ${new Date().toISOString()}\n\n`;
  
  // Group variables by category
  const categories = [
    {
      name: 'Network Configuration',
      keys: ['VITE_STACKS_NETWORK', 'VITE_STACKS_API_URL'],
    },
    {
      name: 'Contract Addresses',
      keys: [
        'VITE_CONTENT_REGISTRY_ADDRESS',
        'VITE_PAYMENT_PROCESSOR_ADDRESS',
        'VITE_ACCESS_CONTROL_ADDRESS',
      ],
    },
    {
      name: 'Admin Configuration',
      keys: [
        'VITE_ADMIN_ADDRESS',
        'VITE_TREASURY_ADDRESS',
        'VITE_PLATFORM_FEE_PERCENTAGE',
      ],
    },
    {
      name: 'Frontend Configuration',
      keys: [
        'VITE_APP_NAME',
        'VITE_APP_DESCRIPTION',
        'VITE_APP_VERSION',
      ],
    },
  ];
  
  categories.forEach(category => {
    content += `# ${category.name}\n`;
    category.keys.forEach(key => {
      const value = envVars.get(key);
      if (value !== undefined) {
        content += `${key}=${value}\n`;
      }
    });
    content += '\n';
  });
  
  // Add any remaining variables
  const usedKeys = new Set(categories.flatMap(c => c.keys));
  const remainingKeys = Array.from(envVars.keys()).filter(key => !usedKeys.has(key));
  
  if (remainingKeys.length > 0) {
    content += '# Additional Configuration\n';
    remainingKeys.forEach(key => {
      content += `${key}=${envVars.get(key)}\n`;
    });
    content += '\n';
  }
  
  return content;
};

/**
 * Validate environment configuration
 */
export const validateEnvironment = (filePath: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    if (!existsSync(filePath)) {
      errors.push(`Environment file not found: ${filePath}`);
      return { valid: false, errors, warnings };
    }
    
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const envVars = new Map<string, string>();
    
    // Parse environment variables
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars.set(key.trim(), valueParts.join('=').trim());
        } else {
          warnings.push(`Line ${index + 1}: Invalid format - ${line}`);
        }
      }
    });
    
    // Required variables
    const required = [
      'VITE_STACKS_NETWORK',
      'VITE_CONTENT_REGISTRY_ADDRESS',
      'VITE_PAYMENT_PROCESSOR_ADDRESS',
      'VITE_ACCESS_CONTROL_ADDRESS',
      'VITE_ADMIN_ADDRESS',
      'VITE_TREASURY_ADDRESS',
    ];
    
    required.forEach(key => {
      if (!envVars.has(key) || !envVars.get(key)) {
        errors.push(`Missing required variable: ${key}`);
      }
    });
    
    // Validate network
    const network = envVars.get('VITE_STACKS_NETWORK');
    if (network && !['testnet', 'mainnet'].includes(network)) {
      errors.push(`Invalid network: ${network}. Must be 'testnet' or 'mainnet'`);
    }
    
    // Validate contract addresses
    const contractAddresses = [
      'VITE_CONTENT_REGISTRY_ADDRESS',
      'VITE_PAYMENT_PROCESSOR_ADDRESS',
      'VITE_ACCESS_CONTROL_ADDRESS',
    ];
    
    const contractAddressPattern = /^S[PT][0-9A-Z]{39}\.[a-z0-9-]+$/;
    contractAddresses.forEach(key => {
      const address = envVars.get(key);
      if (address && !contractAddressPattern.test(address)) {
        errors.push(`Invalid contract address format: ${key}=${address}`);
      }
    });
    
    // Validate principal addresses
    const principalAddresses = ['VITE_ADMIN_ADDRESS', 'VITE_TREASURY_ADDRESS'];
    const principalPattern = /^S[PT][0-9A-Z]{39}$/;
    
    principalAddresses.forEach(key => {
      const address = envVars.get(key);
      if (address && !principalPattern.test(address)) {
        errors.push(`Invalid principal address format: ${key}=${address}`);
      }
    });
    
    // Validate platform fee percentage
    const feePercentage = envVars.get('VITE_PLATFORM_FEE_PERCENTAGE');
    if (feePercentage) {
      const fee = parseInt(feePercentage, 10);
      if (isNaN(fee) || fee < 0 || fee > 10000) {
        errors.push(`Invalid platform fee percentage: ${feePercentage}. Must be between 0 and 10000`);
      }
    }
    
    // Check for API URL consistency
    const apiUrl = envVars.get('VITE_STACKS_API_URL');
    if (network && apiUrl) {
      const expectedUrl = network === 'testnet' 
        ? 'https://api.testnet.hiro.so' 
        : 'https://api.hiro.so';
      
      if (apiUrl !== expectedUrl) {
        warnings.push(`API URL may not match network. Expected: ${expectedUrl}, Got: ${apiUrl}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Failed to validate environment file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { valid: false, errors, warnings };
  }
};

/**
 * Generate environment setup for deployment results
 */
export const generateSetupFromDeployment = (
  network: Network,
  deploymentResults: Array<{ contractName: string; txId: string; success: boolean }>,
  adminAddress: string,
  treasuryAddress: string,
  platformFeePercentage: number = 1000
): EnvironmentSetup | null => {
  const successful = deploymentResults.filter(r => r.success);
  
  if (successful.length !== 3) {
    console.error('❌ Not all contracts deployed successfully');
    return null;
  }
  
  // Map contract names to addresses (using deployment address + contract name)
  const contractAddresses = {
    contentRegistry: '',
    paymentProcessor: '',
    accessControl: '',
  };
  
  successful.forEach(result => {
    const address = `${adminAddress}.${result.contractName}`;
    switch (result.contractName) {
      case 'content-registry':
        contractAddresses.contentRegistry = address;
        break;
      case 'payment-processor':
        contractAddresses.paymentProcessor = address;
        break;
      case 'access-control':
        contractAddresses.accessControl = address;
        break;
    }
  });
  
  return {
    network,
    contractAddresses,
    adminAddress,
    treasuryAddress,
    platformFeePercentage,
  };
};

/**
 * Setup complete environment for a network
 */
export const setupEnvironment = (
  network: Network,
  contractAddresses: {
    contentRegistry: string;
    paymentProcessor: string;
    accessControl: string;
  },
  adminAddress: string,
  treasuryAddress: string,
  platformFeePercentage: number = 1000
): string => {
  const setup: EnvironmentSetup = {
    network,
    contractAddresses,
    adminAddress,
    treasuryAddress,
    platformFeePercentage,
  };
  
  const envFilePath = createEnvironmentFile(setup);
  
  // Validate the created file
  const validation = validateEnvironment(envFilePath);
  
  if (!validation.valid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Environment setup validation failed');
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log(`✅ Environment setup complete for ${network}`);
  return envFilePath;
};