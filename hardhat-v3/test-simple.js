import hre from 'hardhat';

console.log('Testing Hardhat environment...');
console.log('HRE available:', !!hre);
console.log('Ethers available:', !!hre.ethers);

async function test() {
  try {
    const signers = await hre.ethers.getSigners();
    console.log('Signers count:', signers.length);
    console.log('First signer address:', signers[0].address);
    console.log('✅ Hardhat environment is working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
