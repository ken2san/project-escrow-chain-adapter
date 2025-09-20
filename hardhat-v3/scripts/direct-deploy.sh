#!/bin/bash

echo "🚀 Simple direct PointExchange deployment..."

# Create a simple deployment script that uses direct ethers commands
cat > /tmp/direct-deploy.js << 'EOF'
const { ethers } = require('ethers');
const fs = require('fs');

async function deploy() {
  try {
    // Connect to local network
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

    // Use first Hardhat account
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('Deploying with account:', wallet.address);

    // Read contract artifacts
    const contractArtifact = JSON.parse(
      fs.readFileSync('./artifacts/contracts/PointExchange.sol/PointExchange.json', 'utf8')
    );

    // Create contract factory
    const factory = new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      wallet
    );

    // Deploy contract
    console.log('Deploying PointExchange contract...');
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log('DEPLOYED_ADDRESS:', address);

    // Create deployment data
    const deploymentData = {
      PointExchange: address,
      network: 'localhost',
      chainId: 31337,
      deployedAt: new Date().toISOString()
    };

    // Output only the JSON
    console.log(JSON.stringify(deploymentData, null, 2));

  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
EOF

echo "📦 Deploying PointExchange contract..."

# Run deployment and capture output
DEPLOY_OUTPUT=$(node /tmp/direct-deploy.js 2>&1)

# Extract JSON from output (last part after DEPLOYED_ADDRESS line)
JSON_OUTPUT=$(echo "$DEPLOY_OUTPUT" | sed -n '/^{/,/^}$/p')

if [ -n "$JSON_OUTPUT" ]; then
    echo "✅ Contract deployment successful!"

    # Save to frontend locations
    mkdir -p frontend/public
    mkdir -p frontend/src

    echo "$JSON_OUTPUT" > frontend/public/deployed-contracts.json
    echo "$JSON_OUTPUT" > frontend/src/deployed-contracts.json

    echo "💾 Contract address saved to frontend files"
    echo "📋 Deployment data:"
    echo "$JSON_OUTPUT"
    echo "🎉 Real deployment completed successfully!"

else
    echo "❌ Failed to extract deployment data"
    echo "Output: $DEPLOY_OUTPUT"
    exit 1
fi

# Clean up
rm -f /tmp/direct-deploy.js

echo "🚀 Ready for React frontend!"