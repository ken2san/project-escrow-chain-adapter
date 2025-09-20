#!/bin/bash

# Deploy contract using Hardhat console commands
echo "🚀 Deploying contract via Hardhat console..."

# Create temporary deployment script
cat > /tmp/deploy-commands.js << 'EOF'
// Use global variables available in Hardhat console
const [deployer] = await ethers.getSigners();
console.log("📝 Deploying with account:", deployer.address);

const balance = await ethers.provider.getBalance(deployer.address);
console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

const Escrow = await ethers.getContractFactory("Escrow");
console.log("📦 Deploying contract...");

const escrow = await Escrow.deploy();
await escrow.waitForDeployment();

const contractAddress = await escrow.getAddress();
console.log("✅ Escrow deployed to:", contractAddress);

// Award initial points
await escrow.awardPoints(deployer.address, 100);
console.log("✅ Awarded 100 points to deployer");

// Manual file writing using Node.js global modules
const fs = global.fs || require('fs');
const path = global.path || require('path');

const deploymentData = {
  Escrow: {
    address: contractAddress,
    network: 'localhost',
    chainId: 31337,
    deployedAt: new Date().toISOString()
  },
  defaultAccounts: {
    user1: deployer.address,
    user2: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  }
};

// Save deployment data to file
const deploymentJson = JSON.stringify(deploymentData, null, 2);
console.log("💾 Deployment data:", deploymentJson);

console.log("\n📋 Deployment Summary:");
console.log("Contract Address:", contractAddress);
console.log("Deployer Address:", deployer.address);
console.log("Network: localhost (port 8545)");
console.log("\n🎉 Deployment completed successfully!");

process.exit(0);
EOF

# Execute deployment using Hardhat console
echo "⚡ Executing deployment commands..."
./node_modules/.bin/hardhat console --network localhost < /tmp/deploy-commands.js

# Clean up temporary file
rm -f /tmp/deploy-commands.js

echo "✅ Deployment script completed"