const { expect } = require("chai");
const hardhat = require("hardhat");
const { ethers } = require("ethers");
const fs = require("fs").promises;

describe("Escrow Contract", function () {
  let escrow;
  let deployer;
  let user1;
  let user2;

  beforeEach(async function () {
    // Use the same approach as hh-deploy.mjs for ESM compatibility
    const { network } = hardhat;
    const rpc = 'http://127.0.0.1:8545'; // Use hardcoded localhost for testing
    const provider = new ethers.JsonRpcProvider(rpc);

    const accounts = await provider.listAccounts();
    deployer = await provider.getSigner(accounts[0].address);
    user1 = await provider.getSigner(accounts[1]?.address || accounts[0].address);
    user2 = await provider.getSigner(accounts[2]?.address || accounts[0].address);

    // Read compiled artifact directly
    const artifactPath = 'artifacts/contracts/Escrow.sol/Escrow.json';
    const artifactJson = await fs.readFile(artifactPath, 'utf8');
    const artifact = JSON.parse(artifactJson);

    // Deploy contract
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
    escrow = await factory.deploy();
    await escrow.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const address = await escrow.getAddress();
      expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("Points System", function () {
    it("Should award points correctly", async function () {
      const amount = 100;

      await escrow.awardPoints(deployer.address, amount);

      const points = await escrow.points(deployer.address);
      expect(points).to.equal(amount);
    });

    it("Should transfer points between accounts", async function () {
      const initialAmount = 100;
      const transferAmount = 30;

      // Award points to deployer
      await escrow.awardPoints(deployer.address, initialAmount);

      // Transfer points to user1
      await escrow.transferPoints(user1.address, transferAmount);

      // Check balances
      const deployerPoints = await escrow.points(deployer.address);
      const user1Points = await escrow.points(user1.address);

      expect(deployerPoints).to.equal(initialAmount - transferAmount);
      expect(user1Points).to.equal(transferAmount);
    });

    it("Should handle multiple transfers", async function () {
      // Award points to deployer
      await escrow.awardPoints(deployer.address, 200);

      // Transfer to user1 and user2
      await escrow.transferPoints(user1.address, 50);
      await escrow.transferPoints(user2.address, 30);

      // Check all balances
      expect(await escrow.points(deployer.address)).to.equal(120);
      expect(await escrow.points(user1.address)).to.equal(50);
      expect(await escrow.points(user2.address)).to.equal(30);
    });
  });

  describe("Edge Cases", function () {
    it("Should start with zero points", async function () {
      const points = await escrow.points(user1.address);
      expect(points).to.equal(0);
    });

    it("Should award zero points", async function () {
      await escrow.awardPoints(user1.address, 0);
      expect(await escrow.points(user1.address)).to.equal(0);
    });
  });
});