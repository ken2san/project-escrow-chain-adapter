import hre from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Deploying Escrow contract...');

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

  // Save deployment info
  const deploymentData = {
    contractAddress: contractAddress,
    defaultAccount: deployer.address,
    network: 'localhost',
    deployedAt: new Date().toISOString()
  };

  // Save to frontend config
  const frontendDir = path.join(process.cwd(), 'frontend', 'src');
  const configPath = path.join(frontendDir, 'deployed-contracts.json');

  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(deploymentData, null, 2));
  console.log('💾 Saved config to:', configPath);

  console.log('\n📋 Deployment Summary:');
  console.log('Contract Address:', contractAddress);
  console.log('Deployer Address:', deployer.address);
  console.log('Network: localhost (port 8545)');
  console.log('\n🎉 Deployment completed!');

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });