#!/bin/bash

# Simple deployment script that works with current setup
echo "🚀 Deploying PointExchange contract..."

# Create a simple deployment command using the working approach
cat << 'EOF' > /tmp/deploy-command.js
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

async function deploy() {
  try {
    // Connect to local network
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // First hardhat account
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('📝 Deploying with account:', wallet.address);

    // Read contract ABI and bytecode
    const contractPath = './artifacts/contracts/PointExchange.sol/PointExchange.json';
    const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

    // Create contract factory
    const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, wallet);

    console.log('📦 Deploying contract...');
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log('✅ PointExchange deployed to:', address);

    // Save to JSON files
    const contractInfo = {
      PointExchange: address,
      network: "localhost",
      deployedAt: new Date().toISOString()
    };

    // Save to frontend locations
    const publicPath = './frontend/public/deployed-contracts.json';
    const srcPath = './frontend/src/deployed-contracts.json';

    fs.writeFileSync(publicPath, JSON.stringify(contractInfo, null, 2));
    fs.writeFileSync(srcPath, JSON.stringify(contractInfo, null, 2));

    console.log('💾 Contract address saved to frontend files');
    console.log('🎉 Deployment completed successfully!');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
EOF

# Run the deployment
node /tmp/deploy-command.js

# Clean up
rm /tmp/deploy-command.js

echo "✅ Deployment script completed"