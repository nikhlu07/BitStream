// Simple script to generate a testnet wallet
const crypto = require('crypto');

// Generate a simple 12-word mnemonic for testnet (this is just for testing)
const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance'
];

function generateMnemonic() {
    const mnemonic = [];
    for (let i = 0; i < 12; i++) {
        const randomIndex = crypto.randomInt(0, words.length);
        mnemonic.push(words[randomIndex]);
    }
    return mnemonic.join(' ');
}

const mnemonic = generateMnemonic();
console.log('Generated mnemonic:', mnemonic);

// Update the Testnet.toml file
const fs = require('fs');
const path = require('path');

const testnetConfig = `[network]
name = "testnet"
stacks_node_rpc_address = "https://api.testnet.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "${mnemonic}"
balance = 100000000

`;

fs.writeFileSync(path.join(__dirname, 'settings', 'Testnet.toml'), testnetConfig);
console.log('Updated Testnet.toml with generated mnemonic');
console.log('');
console.log('Note: This is a test mnemonic. For production, use a secure mnemonic generation method.');