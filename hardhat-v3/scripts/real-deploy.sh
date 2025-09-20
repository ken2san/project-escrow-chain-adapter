#!/bin/bash

echo "🚀 Real Escrow contract deployment..."

# Create expect script for automated Hardhat console deployment
cat > /tmp/deploy-expect.exp << 'EOF'
#!/usr/bin/expect -f

set timeout 30

# Start Hardhat console
spawn npx hardhat console --network localhost

# Wait for console prompt
expect "> "

# Deploy contract step by step
send "const Escrow = await ethers.getContractFactory('Escrow');\r"
expect "> "

send "const escrow = await Escrow.deploy();\r"
expect "> "

send "await escrow.waitForDeployment();\r"
expect "> "

send "const address = await escrow.getAddress();\r"
expect "> "

send "console.log('DEPLOYED_ADDRESS:', address);\r"
expect "> "

send "process.exit(0);\r"
expect eof
EOF

# Make expect script executable
chmod +x /tmp/deploy-expect.exp

echo "📦 Deploying Escrow contract..."

# Run expect script and capture output
DEPLOY_OUTPUT=$(/tmp/deploy-expect.exp 2>&1)

# Extract contract address from output (remove ANSI escape sequences)
DEPLOYED_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "DEPLOYED_ADDRESS:" | sed 's/.*DEPLOYED_ADDRESS: //' | sed 's/\x1b\[[0-9;]*m//g' | tr -d '\r\n')

if [ -n "$DEPLOYED_ADDRESS" ]; then
    echo "✅ PointExchange deployed to: $DEPLOYED_ADDRESS"

    # Create deployment data
    cat > /tmp/deployment-data.json << EOF
{
  "PointExchange": "$DEPLOYED_ADDRESS",
  "network": "localhost",
  "chainId": 31337,
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
}
EOF

    # Save to frontend locations
    mkdir -p frontend/public
    mkdir -p frontend/src

    cp /tmp/deployment-data.json frontend/public/deployed-contracts.json
    cp /tmp/deployment-data.json frontend/src/deployed-contracts.json

    echo "💾 Contract address saved to frontend files"
    echo "🎉 Real deployment completed successfully!"

else
    echo "❌ Deployment failed - could not extract contract address"
    echo "Output: $DEPLOY_OUTPUT"
    exit 1
fi

# Clean up
rm -f /tmp/deploy-expect.exp /tmp/deployment-data.json

echo "🚀 Ready for React frontend!"