import hre from 'hardhat';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 Deploying Escrow contract...');

  // Create provider and connect to local network
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

  // Get signers from provider
  const signers = await provider.listAccounts();
  console.log('🔍 Available accounts:', signers.length);

  // Create signers for the first 3 accounts
  const deployer = new ethers.Wallet(
    // Use default Hardhat account #0 private key
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );

  const user1 = new ethers.Wallet(
    // Use default Hardhat account #1 private key
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    provider
  );

  const user2 = new ethers.Wallet(
    // Use default Hardhat account #2 private key
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    provider
  );

  console.log('📝 Deploying with account:', deployer.address);

  // Check balance
  const balance = await provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');

  // Load contract artifacts manually
  const contractPath = './artifacts/contracts/Escrow.sol/Escrow.json';
  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  // Create contract factory
  const contractFactory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    deployer
  );

  console.log('📦 Deploying contract...');

  // Deploy contract
  const escrow = await contractFactory.deploy();
  await escrow.waitForDeployment();

  const contractAddress = await escrow.getAddress();
  console.log('✅ Escrow deployed to:', contractAddress);

  // Award initial points for testing
  console.log('🎁 Awarding initial points...');
  try {
    // Wait for deployment to be fully confirmed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get fresh nonce after deployment
    let currentNonce = await provider.getTransactionCount(deployer.address);
    console.log('📊 Current deployer nonce:', currentNonce);

    // Award points to User1
    console.log(`🎯 Awarding 100 points to User1 (${user1.address})...`);
    const tx1 = await escrow.awardPoints(user1.address, 100, {
      nonce: currentNonce,
      gasLimit: 100000
    });
    console.log('📝 Transaction 1 hash:', tx1.hash);
    await tx1.wait();
    console.log('✅ User1 points awarded successfully');

    // Wait and get updated nonce
    await new Promise(resolve => setTimeout(resolve, 1000));
    currentNonce = await provider.getTransactionCount(deployer.address);

    // Award points to User2
    console.log(`🎯 Awarding 50 points to User2 (${user2.address})...`);
    const tx2 = await escrow.awardPoints(user2.address, 50, {
      nonce: currentNonce,
      gasLimit: 100000
    });
    console.log('📝 Transaction 2 hash:', tx2.hash);
    await tx2.wait();
    console.log('✅ User2 points awarded successfully');

    // Verify points were awarded correctly
    const user1Points = await escrow.points(user1.address);
    const user2Points = await escrow.points(user2.address);
    console.log('📊 Final verification:');
    console.log(`   User1 points: ${user1Points}`);
    console.log(`   User2 points: ${user2Points}`);

  } catch (error) {
    console.log('⚠️  Failed to award points:', error.message);
    console.log('🔧 You can manually run: npx hardhat run scripts/award-points.mjs --network localhost');
  }  // Create deployment info
  const deploymentData = {
    Escrow: {
      address: contractAddress,
      network: 'localhost',
      chainId: 31337,
      deployedAt: new Date().toISOString()
    },
    defaultAccounts: {
      user1: user1.address,
      user2: user2.address
    }
  };

  // Save to both frontend locations
  const projectRoot = path.join(__dirname, '..');
  const publicPath = path.join(projectRoot, 'frontend', 'public', 'deployed-contracts.json');
  const srcPath = path.join(projectRoot, 'frontend', 'src', 'deployed-contracts.json');

  // Ensure directories exist
  const publicDir = path.dirname(publicPath);
  const srcDir = path.dirname(srcPath);

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Write files
  fs.writeFileSync(publicPath, JSON.stringify(deploymentData, null, 2));
  fs.writeFileSync(srcPath, JSON.stringify(deploymentData, null, 2));

  console.log('💾 Saved config to:', publicPath);
  console.log('💾 Saved config to:', srcPath);

  console.log('\n📋 Deployment Summary:');
  console.log('Contract Address:', contractAddress);
  console.log('Deployer Address:', deployer.address);
  console.log('User1 Address:', user1.address, '(100 points)');
  console.log('User2 Address:', user2.address, '(50 points)');
  console.log('Network: localhost (port 8545)');
  console.log('\n🎉 Real deployment completed!');

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });