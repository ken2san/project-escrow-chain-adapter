// Show current Hardhat accounts
import { ethers } from 'ethers';

async function main() {
  console.log('Current Hardhat Test Accounts:');
  console.log('=====================================');

  // Connect to local node
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

  // Get all accounts
  const accounts = await provider.listAccounts();

  for (let i = 0; i < Math.min(accounts.length, 10); i++) {
    const address = accounts[i].address;
    const balance = await provider.getBalance(address);
    const ethBalance = ethers.formatEther(balance);

    console.log(`Account #${i}: ${address}`);
    console.log(`  Balance: ${ethBalance} ETH`);
    console.log('');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });