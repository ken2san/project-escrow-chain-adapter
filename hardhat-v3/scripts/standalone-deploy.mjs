import fs from 'fs/promises';
import { ethers } from 'ethers';

async function main() {
  const rpc = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpc);
  console.log('Using RPC:', rpc);
  const accounts = await provider.listAccounts();
  if (!accounts || accounts.length === 0) {
    console.error('No accounts returned by provider. Is the node running and unlocked?');
    throw new Error('No accounts available from provider');
  }
  const deployerAddress = accounts[0];
  // Prefer an explicit private key if provided (hardhat node prints these when started)
  const priv = process.env.PRIVATE_KEY;
  let signer;
  if (priv) {
    signer = new ethers.Wallet(priv, provider);
    console.log('Using PRIVATE_KEY from env for signer. Address:', await signer.getAddress());
  } else {
    signer = provider.getSigner(deployerAddress);
    console.log('Deployer address:', deployerAddress);
  }

  const artifactPath = 'artifacts/contracts/Escrow.sol/Escrow.json';
  const artifactJson = await fs.readFile(artifactPath, 'utf8');
  const artifact = JSON.parse(artifactJson);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode);
  console.log('Deploying Escrow contract...');
  let contract;
  try {
    contract = await factory.connect(signer).deploy();
  } catch (e) {
    if (e && e.code === 'UNSUPPORTED_OPERATION') {
      console.error('Deploy failed: provider signer does not support sending transactions with this runner.');
      console.error('If you are running a local Hardhat node, start it with `npx hardhat node` and pass the corresponding private key as PRIVATE_KEY env var.');
    }
    throw e;
  }
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    await provider.waitForTransaction(deployTx.hash);
  } else {
    await contract.waitForDeployment();
  }
  const address = await contract.getAddress();
  console.log('Escrow deployed to:', address);

  // Basic points operations
  try {
  const deployer = await signer.getAddress();
  console.log('Awarding 100 points to deployer:', deployer);
    // After deployment has been mined, re-read the pending nonce to avoid collisions with automining
    let nonce = await provider.getTransactionCount(deployer, 'pending');
    // Use explicit nonce for subsequent txs to avoid "nonce too low" when automining
    const tx1 = await contract.connect(signer).awardPoints(deployer, 100, { nonce });
    await tx1.wait();
    nonce = nonce + 1;
    console.log('Awarded. Querying points...');
  const points = await contract.points(deployer);
    console.log('Deployer points:', points.toString());

    // If there is a second signer, transfer some points
    try {
      const accountsNow = await provider.listAccounts();
      const receiver = accountsNow[1];
      if (receiver) {
  console.log('Transferring 30 points to', receiver);
        // Use explicit nonce (we incremented after awardPoints)
        const tx2 = await contract.connect(signer).transferPoints(receiver, 30, { nonce });
        await tx2.wait();
        nonce = nonce + 1;
        console.log('Transfer complete');
        const afterSender = await contract.points(deployer);
        const afterReceiver = await contract.points(receiver);
        console.log('After - sender:', afterSender.toString(), 'receiver:', afterReceiver.toString());
      } else {
        console.log('No second account available to transfer points to.');
      }
    } catch (e) {
      console.warn('TransferPoints failed:', e.message);
    }
  } catch (e) {
    console.warn('Points operations failed:', e.message);
  }

  return address;
}

main()
  .then((addr) => {
    console.log('\nDone. Contract address:', addr);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
