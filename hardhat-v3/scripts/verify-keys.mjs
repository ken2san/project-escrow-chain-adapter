// Verify Private Key to Address conversion
import { ethers } from 'ethers';

const privateKeys = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c6a2c4b6b35ee0e2de6c5',
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'
];

console.log('Private Key to Address Verification:');
console.log('=====================================');

privateKeys.forEach((privateKey, index) => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log(`Key #${index}:`);
    console.log(`  Private Key: ${privateKey}`);
    console.log(`  Address: ${wallet.address}`);
    console.log('');
  } catch (error) {
    console.log(`Error with key #${index}:`, error.message);
  }
});

// Check your specific address
console.log('Checking your address:');
console.log('=====================');
try {
  // Try to find which private key generates 0xbD3e33013aA42e6835146f726aE5B0Ad745Cc453
  const targetAddress = '0xbD3e33013aA42e6835146f726aE5B0Ad745Cc453';
  console.log(`Target Address: ${targetAddress}`);

  // Check if it matches any of our known addresses
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  provider.listAccounts().then(accounts => {
    const found = accounts.find(acc => acc.address.toLowerCase() === targetAddress.toLowerCase());
    if (found) {
      console.log('✅ This address exists in the current Hardhat accounts');
    } else {
      console.log('❌ This address is NOT in the current Hardhat accounts');
    }
  });

} catch (error) {
  console.log('Error checking address:', error.message);
}