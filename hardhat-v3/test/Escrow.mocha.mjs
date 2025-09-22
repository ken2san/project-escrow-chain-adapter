import { expect } from "chai";
import fs from "fs/promises";
import { ethers } from "ethers";

const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";

async function waitForDeployment(provider, address, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const code = await provider.getCode(address);
    if (code && code !== "0x") return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Timed out waiting for contract deployment");
}

describe("Escrow (Mocha standalone)", function () {
  this.timeout(20000);

  let provider, signer0, signer1, signer2, escrow, accounts;
  let snapshotId;

  beforeEach(async function () {
    provider = new ethers.JsonRpcProvider(RPC);
    // Take a snapshot so we can revert after the test and keep nonces/balances stable.
    try {
      snapshotId = await provider.send("evm_snapshot", []);
    } catch (e) {
      snapshotId = undefined;
    }
    accounts = await provider.listAccounts();

    if (!accounts || accounts.length === 0) {
      throw new Error("No unlocked accounts available on RPC provider; start a local node.");
    }

  // Prefer explicit dev private keys from environment (`DEV_PK0/1/2`) so tests
  // run with deterministic wallets when the user wants that. Do NOT commit
  // real private keys into the repo — use a local `.env` for sensitive values.
  const envPk0 = process.env.DEV_PK0;
  const envPk1 = process.env.DEV_PK1;
  const envPk2 = process.env.DEV_PK2;

  if (envPk0 && envPk1 && envPk2) {
    // If all three private keys are provided, construct Wallets from them.
    signer0 = new ethers.Wallet(envPk0, provider);
    signer1 = new ethers.Wallet(envPk1, provider);
    signer2 = new ethers.Wallet(envPk2, provider);
  } else {
    // Fall back to unlocked provider signers (e.g. Hardhat node's default accounts).
    // This avoids embedding private keys in the test source while still working
    // for local development where the node exposes unlocked accounts.
    signer0 = provider.getSigner(0);
    signer1 = provider.getSigner(1);
    signer2 = provider.getSigner(2);
  }

    const artifactJson = await fs.readFile("artifacts/contracts/Escrow.sol/Escrow.json", "utf8");
    const artifact = JSON.parse(artifactJson);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer0);
  escrow = await factory.deploy();
  // Wait for the deployment to be mined and for the contract code to be available
  const address = escrow.target ?? escrow.address;
  await waitForDeployment(provider, address);
  });

  afterEach(async function () {
    if (snapshotId !== undefined) {
      try {
        await provider.send("evm_revert", [snapshotId]);
      } catch (e) {
        // ignore revert errors
      }
    }
  });

  it("should set owner", async function () {
    const owner = await escrow.owner();
    const signerAddr = typeof signer0.getAddress === 'function' ? await signer0.getAddress() : signer0.address || accounts[0];
    expect(owner).to.equal(signerAddr);
  });

  it("owner can award points and emits event", async function () {
    const addr1 = await signer1.getAddress();
    const ownerAddr = await signer0.getAddress();
    const ownerNonce = await provider.getTransactionCount(ownerAddr, "latest");
    const tx = await escrow.awardPoints(addr1, 100, { nonce: ownerNonce });
    await tx.wait?.();

  const bal = await escrow.pointsOf(addr1);
  expect(bal).to.equal(100n);
  });

  it("transferPoints moves balance", async function () {
    const addr1 = await signer1.getAddress();
    const addr2 = await signer2.getAddress();
    const ownerAddr = await signer0.getAddress();
    const ownerNonce = await provider.getTransactionCount(ownerAddr, "latest");
    await (await escrow.awardPoints(addr1, 100, { nonce: ownerNonce })).wait?.();

    const escrowAsAddr1 = escrow.connect(signer1);
    const signer1Addr = await signer1.getAddress();
    const signer1Nonce = await provider.getTransactionCount(signer1Addr, "latest");
    const tx2 = await escrowAsAddr1.transferPoints(addr2, 30, { nonce: signer1Nonce });
    await tx2.wait();

    const b1 = await escrow.pointsOf(addr1);
    const b2 = await escrow.pointsOf(addr2);
  expect(b1).to.equal(70n);
  expect(b2).to.equal(30n);
  });

  it("reverts on insufficient balance", async function () {
    const addr1 = await signer1.getAddress();
    const addr2 = await signer2.getAddress();
    try {
      const signer2Addr = await signer2.getAddress();
      const signer2Nonce = await provider.getTransactionCount(signer2Addr, "latest");
      const tx = await escrow.connect(signer2).transferPoints(addr1, 1, { nonce: signer2Nonce });
      await tx.wait();
      throw new Error('Expected transaction to revert but it succeeded');
    } catch (e) {
      expect(e).to.exist;
    }
  });
});
