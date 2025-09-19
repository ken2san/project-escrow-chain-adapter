import hre from 'hardhat';

async function main() {
  console.log('Deploying Escrow contract...');

  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  const Escrow = await hre.ethers.getContractFactory('Escrow');
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();

  const contractAddress = await escrow.getAddress();
  console.log('✅ Escrow contract deployed to:', contractAddress);

  // Award some initial points for testing
  console.log('Awarding initial points for testing...');
  await escrow.awardPoints(deployer.address, 100);
  console.log('✅ Awarded 100 points to deployer');

  console.log('\n📋 Contract Details:');
  console.log('Contract Address:', contractAddress);
  console.log('Deployer Address:', deployer.address);
  console.log('Network: localhost');

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((address) => {
    console.log('\n🎉 Deployment completed successfully!');
    console.log('Copy this address to your React app:', address);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });