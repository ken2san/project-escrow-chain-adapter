import { expect } from "chai";
import { ethers } from "hardhat";

describe("Escrow (Points MVP)", function () {
  let owner, addr1, addr2;
  let escrow;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
  });

  it("should set owner", async function () {
    expect(await escrow.owner()).to.equal(await owner.getAddress());
  });

  it("owner can award points and emits event", async function () {
    await expect(escrow.awardPoints(await addr1.getAddress(), 100))
      .to.emit(escrow, "PointsAwarded")
      .withArgs(await addr1.getAddress(), 100);

    const bal = await escrow.pointsOf(await addr1.getAddress());
    expect(bal).to.equal(100);
  });

  it("transferPoints moves balance and emits event", async function () {
    await (await escrow.awardPoints(await addr1.getAddress(), 100)).wait();

    const escrowAsAddr1 = escrow.connect(addr1);
    await expect(escrowAsAddr1.transferPoints(await addr2.getAddress(), 30))
      .to.emit(escrow, "PointsTransferred")
      .withArgs(await addr1.getAddress(), await addr2.getAddress(), 30);

    expect(await escrow.pointsOf(await addr1.getAddress())).to.equal(70);
    expect(await escrow.pointsOf(await addr2.getAddress())).to.equal(30);
  });

  it("reverts on insufficient balance", async function () {
    await expect(
      escrow.connect(addr2).transferPoints(await addr1.getAddress(), 1)
    ).to.be.revertedWith("Insufficient balance");
  });
});
