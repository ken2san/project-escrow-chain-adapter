const { expect } = require('chai');
const hre = require('hardhat');

describe('Escrow (CJS test)', function () {
  let escrow;
  let owner, addr1, addr2;

  beforeEach(async function () {
    const { ethers } = hre;
    [owner, addr1, addr2] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory('Escrow');
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
  });

  it('owner is set', async function () {
    expect(await escrow.owner()).to.equal(await owner.getAddress());
  });

  it('awardPoints increases balance and emits', async function () {
    await expect(escrow.awardPoints(await addr1.getAddress(), 100))
      .to.emit(escrow, 'PointsAwarded')
      .withArgs(await addr1.getAddress(), 100);
    expect(await escrow.pointsOf(await addr1.getAddress())).to.equal(100);
  });

  it('transferPoints moves points and emits', async function () {
    await (await escrow.awardPoints(await addr1.getAddress(), 100)).wait();
    const e1 = escrow.connect(addr1);
    await expect(e1.transferPoints(await addr2.getAddress(), 30))
      .to.emit(escrow, 'PointsTransferred')
      .withArgs(await addr1.getAddress(), await addr2.getAddress(), 30);
    expect(await escrow.pointsOf(await addr1.getAddress())).to.equal(70);
    expect(await escrow.pointsOf(await addr2.getAddress())).to.equal(30);
  });
});
