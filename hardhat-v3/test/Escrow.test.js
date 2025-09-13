import { expect } from 'chai';
import hre from 'hardhat';

describe('Escrow (v3 experiment) - ESM', function () {
  it('should deploy and create a transaction', async function () {
    const [buyer, seller] = await hre.ethers.getSigners();
    const Escrow = await hre.ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(buyer).createTransaction(seller.address, { value: hre.ethers.parseEther('1.0') });

    const txn = await escrow.transactions(0);
    expect(txn.buyer).to.equal(buyer.address);
    expect(txn.seller).to.equal(seller.address);
    expect(txn.amount.toString()).to.equal(hre.ethers.parseEther('1.0').toString());
    expect(txn.state).to.equal(1);
  });

  it('should release funds to seller', async function () {
    const [buyer, seller] = await hre.ethers.getSigners();
    const Escrow = await hre.ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(buyer).createTransaction(seller.address, { value: hre.ethers.parseEther('1.0') });
    await escrow.connect(seller).releaseFunds(0);

    const txn = await escrow.transactions(0);
    expect(txn.state).to.equal(2);
  });

  it('should refund funds to buyer', async function () {
    const [buyer, seller] = await hre.ethers.getSigners();
    const Escrow = await hre.ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(buyer).createTransaction(seller.address, { value: hre.ethers.parseEther('1.0') });
    await escrow.connect(buyer).refundFunds(0);

    const txn = await escrow.transactions(0);
    expect(txn.state).to.equal(3);
  });

  it('should award and transfer points between accounts', async function () {
    const [alice, bob] = await hre.ethers.getSigners();
    const Escrow = await hre.ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(alice).awardPoints(alice.address, 100);
    const alicePoints = await escrow.points(alice.address);
    expect(alicePoints).to.equal(100);

    await escrow.connect(alice).transferPoints(bob.address, 30);
    const aliceAfter = await escrow.points(alice.address);
    const bobAfter = await escrow.points(bob.address);
    expect(aliceAfter).to.equal(70);
    expect(bobAfter).to.equal(30);
  });
});
