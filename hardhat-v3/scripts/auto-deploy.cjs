const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Deploying Escrow contract...');

  try {
    // Get signers
    const [deployer] = await hre.ethers.getSigners();
    console.log('📝 Deploying with account:', deployer.address);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log('💰 Account balance:', hre.ethers.formatEther(balance), 'ETH');

    // Deploy contract
    const Escrow = await hre.ethers.getContractFactory('Escrow');
    console.log('📦 Deploying contract...');

    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    const contractAddress = await escrow.getAddress();
    console.log('✅ Escrow deployed to:', contractAddress);

    // Award initial points for testing
    console.log('🎁 Awarding initial points...');
    try {
      await escrow.awardPoints(deployer.address, 100);
      console.log('✅ Awarded 100 points to deployer');
    } catch (error) {
      console.log('⚠️  Failed to award points:', error.message);
    }

    // Save deployment info for frontend
    const deploymentData = {
      Escrow: {
        address: contractAddress,
        network: 'localhost',
        chainId: 31337,
        deployedAt: new Date().toISOString()
      },
      defaultAccounts: {
        user1: deployer.address,
        user2: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' // Second hardhat account
      }
    };

    // Save to frontend public folder for React to access
    const frontendPublicDir = path.join(process.cwd(), 'frontend', 'public');
    const configPath = path.join(frontendPublicDir, 'deployed-contracts.json');

    if (!fs.existsSync(frontendPublicDir)) {
      fs.mkdirSync(frontendPublicDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(deploymentData, null, 2));
    console.log('💾 Saved config to:', configPath);

    // Also save to src folder for useEffect to load
    const frontendSrcDir = path.join(process.cwd(), 'frontend', 'src');
    const srcConfigPath = path.join(frontendSrcDir, 'deployed-contracts.json');

    if (!fs.existsSync(frontendSrcDir)) {
      fs.mkdirSync(frontendSrcDir, { recursive: true });
    }

    fs.writeFileSync(srcConfigPath, JSON.stringify(deploymentData, null, 2));
    console.log('💾 Also saved to src:', srcConfigPath);

    console.log('\n📋 Deployment Summary:');
    console.log('Contract Address:', contractAddress);
    console.log('Deployer Address:', deployer.address);
    console.log('Network: localhost (port 8545)');
    console.log('\n🎉 Deployment completed successfully!');

    return contractAddress;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n✅ Ready for React frontend!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });