import hre from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Deploying PointExchange contract...');

  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  const PointExchange = await hre.ethers.getContractFactory('PointExchange');
  const pointExchange = await PointExchange.deploy();
  await pointExchange.waitForDeployment();

  const contractAddress = await pointExchange.getAddress();
  console.log('✅ PointExchange contract deployed to:', contractAddress);

  // Save contract address to JSON files
  const contractInfo = {
    PointExchange: contractAddress,
    network: "localhost",
    deployedAt: new Date().toISOString()
  };

  // Save to frontend/public
  const publicPath = path.join(process.cwd(), 'frontend', 'public', 'deployed-contracts.json');
  fs.writeFileSync(publicPath, JSON.stringify(contractInfo, null, 2));
  console.log('✅ Contract address saved to frontend/public/deployed-contracts.json');

  // Save to frontend/src
  const srcPath = path.join(process.cwd(), 'frontend', 'src', 'deployed-contracts.json');
  fs.writeFileSync(srcPath, JSON.stringify(contractInfo, null, 2));
  console.log('✅ Contract address saved to frontend/src/deployed-contracts.json');

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