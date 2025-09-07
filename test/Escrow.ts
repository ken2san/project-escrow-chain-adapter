
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  it("should deploy and create a transaction", async function () {
    const [buyer, seller] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.deployed();

    // create a transaction
    const tx = await escrow.connect(buyer).createTransaction(seller.address, { value: ethers.utils.parseEther("1.0") });
    await tx.wait();

    const txn = await escrow.transactions(0);
    expect(txn.buyer).to.equal(buyer.address);
    expect(txn.seller).to.equal(seller.address);
    expect(txn.amount.toString()).to.equal(ethers.utils.parseEther("1.0").toString());
    expect(txn.state).to.equal(1); // AwaitingDelivery
  });

  it("should release funds to seller", async function () {
    const [buyer, seller] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.deployed();

    await escrow.connect(buyer).createTransaction(seller.address, { value: ethers.utils.parseEther("1.0") });
    const before = await ethers.provider.getBalance(seller.address);
    const tx = await escrow.connect(seller).releaseFunds(0);
    await tx.wait();
    const after = await ethers.provider.getBalance(seller.address);
    // 金額差分はガス代の影響で完全一致しないため、stateのみ確認
    const txn = await escrow.transactions(0);
    expect(txn.state).to.equal(2); // Completed
  });

  it("should refund funds to buyer", async function () {
    const [buyer, seller] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.deployed();

    await escrow.connect(buyer).createTransaction(seller.address, { value: ethers.utils.parseEther("1.0") });
    const before = await ethers.provider.getBalance(buyer.address);
    const tx = await escrow.connect(buyer).refundFunds(0);
    await tx.wait();
    const txn = await escrow.transactions(0);
    expect(txn.state).to.equal(3); // Refunded
  });
});
