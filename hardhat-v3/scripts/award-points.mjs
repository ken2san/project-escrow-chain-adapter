import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🎁 Awarding initial points to test accounts...');

  // Create provider and connect to local network
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

  // Create deployer signer (account #0)
  const deployer = new ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );

  // Read contract address from config
  const projectRoot = path.join(__dirname, '..');
  const configPath = path.join(projectRoot, 'frontend', 'src', 'deployed-contracts.json');

  if (!fs.existsSync(configPath)) {
    throw new Error('Contract config not found. Please deploy contract first.');
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const contractAddress = config.Escrow?.address;

  if (!contractAddress) {
    throw new Error('Contract address not found in config');
  }

  console.log('📋 Contract address:', contractAddress);
  console.log('🔑 Deployer address:', deployer.address);

  // Load contract artifacts
  const contractPath = path.join(projectRoot, 'artifacts', 'contracts', 'Escrow.sol', 'Escrow.json');
  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  // Create contract instance
  const escrow = new ethers.Contract(contractAddress, contractArtifact.abi, deployer);

  // Define test accounts
  const testAccounts = [
    {
      name: 'User1',
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      points: 100
    },
    {
      name: 'User2',
      address: '0xbD3e33013aA42e6835146f726aE5B0Ad745Cc453',
      points: 50
    }
  ];

  // Award points to each account
  for (const account of testAccounts) {
    try {
      console.log(`\n🎯 Awarding ${account.points} points to ${account.name} (${account.address})...`);

      const tx = await escrow.awardPoints(account.address, account.points);
      console.log('📝 Transaction hash:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

      // Verify points were awarded
      const currentPoints = await escrow.points(account.address);
      console.log('📊 Current points for', account.name + ':', currentPoints.toString());

    } catch (error) {
      console.error(`❌ Failed to award points to ${account.name}:`, error.message);
    }
  }

  console.log('\n🎉 Point awarding completed!');
  console.log('💡 You can now test point transfers in the React app.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });