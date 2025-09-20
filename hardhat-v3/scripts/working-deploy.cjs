const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Deploying Escrow contract...');

  try {
    const [deployer] = await ethers.getSigners();
    console.log('📝 Deploying with account:', deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');

    const Escrow = await ethers.getContractFactory('Escrow');
    console.log('📦 Deploying contract...');

    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    const contractAddress = await escrow.getAddress();
    console.log('✅ Escrow deployed to:', contractAddress);

    // Award initial points
    console.log('🎁 Awarding initial points...');
    await escrow.awardPoints(deployer.address, 100);
    console.log('✅ Awarded 100 points to deployer');

    // Save deployment info
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

    // Ensure directories exist
    const frontendPublicDir = path.join(process.cwd(), 'frontend', 'public');
    const frontendSrcDir = path.join(process.cwd(), 'frontend', 'src');

    if (!fs.existsSync(frontendPublicDir)) {
      fs.mkdirSync(frontendPublicDir, { recursive: true });
    }
    if (!fs.existsSync(frontendSrcDir)) {
      fs.mkdirSync(frontendSrcDir, { recursive: true });
    }

    // Save to both locations
    const publicPath = path.join(frontendPublicDir, 'deployed-contracts.json');
    const srcPath = path.join(frontendSrcDir, 'deployed-contracts.json');

    fs.writeFileSync(publicPath, JSON.stringify(deploymentData, null, 2));
    fs.writeFileSync(srcPath, JSON.stringify(deploymentData, null, 2));

    console.log('💾 Saved config to:', publicPath);
    console.log('💾 Also saved to:', srcPath);

    console.log('\n📋 Deployment Summary:');
    console.log('Contract Address:', contractAddress);
    console.log('Deployer Address:', deployer.address);
    console.log('Network: localhost (port 8545)');
    console.log('\n🎉 Deployment completed successfully!');

    return contractAddress;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });