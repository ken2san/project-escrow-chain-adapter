import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Escrow (v3 experiment) - ESM', function () {
  it('should deploy and create a transaction', async function () {
    const [buyer, seller] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(buyer).createTransaction(seller.address, { value: ethers.parseEther('1.0') });

    const txn = await escrow.transactions(0);
    expect(txn.buyer).to.equal(buyer.address);
    expect(txn.seller).to.equal(seller.address);
    expect(txn.amount.toString()).to.equal(ethers.parseEther('1.0').toString());
    expect(txn.state).to.equal(1);
  });

  it('should release funds to seller', async function () {
    const [buyer, seller] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(buyer).createTransaction(seller.address, { value: ethers.parseEther('1.0') });
    await escrow.connect(seller).releaseFunds(0);

    const txn = await escrow.transactions(0);
    expect(txn.state).to.equal(2);
  });

  it('should refund funds to buyer', async function () {
    const [buyer, seller] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(buyer).createTransaction(seller.address, { value: ethers.parseEther('1.0') });
    await escrow.connect(buyer).refundFunds(0);

    const txn = await escrow.transactions(0);
    expect(txn.state).to.equal(3);
  });
});
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Escrow (v3 experiment)", function () {
  it("should deploy and create a transaction", async function () {
    const [buyer, seller] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(buyer).createTransaction(seller.address, { value: ethers.parseEther("1.0") });

    const txn = await escrow.transactions(0);
    expect(txn.buyer).to.equal(buyer.address);
    expect(txn.seller).to.equal(seller.address);
    expect(txn.amount.toString()).to.equal(ethers.parseEther("1.0").toString());
    expect(txn.state).to.equal(1); // AwaitingDelivery
  });

  it("should release funds to seller", async function () {
    const [buyer, seller] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(buyer).createTransaction(seller.address, { value: ethers.parseEther("1.0") });
    await escrow.connect(seller).releaseFunds(0);

    const txn = await escrow.transactions(0);
    expect(txn.state).to.equal(2); // Completed
  });

  it("should refund funds to buyer", async function () {
    const [buyer, seller] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    await escrow.connect(buyer).createTransaction(seller.address, { value: ethers.parseEther("1.0") });
    await escrow.connect(buyer).refundFunds(0);

    const txn = await escrow.transactions(0);
    expect(txn.state).to.equal(3); // Refunded
  });
});
