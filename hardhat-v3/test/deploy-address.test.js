import hre from 'hardhat';

describe('Deploy Escrow contract and print address', function () {
  it('deploys and prints address', async function () {
    const Escrow = await hre.ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
    const address = await escrow.getAddress();
    console.log('Escrow contract address:', address);
  });
});
