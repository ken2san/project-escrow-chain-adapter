// Use dynamic import to ensure Hardhat runtime and plugins are initialized in ESM
const hardhat = await import('hardhat');
const { network } = hardhat;
const fs = await import('fs/promises');
const { ethers } = await import('ethers');

async function main() {
  // Build a provider from the network config (fallback to localhost)
  const rpc = network?.config?.url || 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpc);

  const accounts = await provider.listAccounts();
  if (!accounts || accounts.length === 0) throw new Error('No accounts available from provider');
  const deployerSigner = await provider.getSigner(accounts[0].address);
  const receiverSigner = await provider.getSigner(accounts[1]?.address || accounts[0].address);

  console.log('Deployer address:', deployerSigner.address);
  console.log('Receiver address:', receiverSigner.address);

  // Read compiled artifact directly
  const artifactPath = 'artifacts/contracts/Escrow.sol/Escrow.json';
  const artifactJson = await fs.readFile(artifactPath, 'utf8');
  const artifact = JSON.parse(artifactJson);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployerSigner);
  const contract = await factory.deploy();
  // Wait for deployment transaction to be mined
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    await provider.waitForTransaction(deployTx.hash);
  } else {
    await contract.waitForDeployment();
  }
  const addr = await contract.getAddress();
  console.log('Escrow deployed to:', addr);

  // Award and transfer
  // Use explicit pending nonce to be safe with automining
  const deployerAddress = deployerSigner.address;
  let nonce = await provider.getTransactionCount(deployerAddress, 'pending');

  const tx1 = await contract.connect(deployerSigner).awardPoints(deployerAddress, 100, { nonce });
  await tx1.wait();
  nonce = nonce + 1;
  console.log('Awarded 100 to deployer. Current:', (await contract.points(deployerAddress)).toString());

  const receiverAddress = receiverSigner.address;
  const tx2 = await contract.connect(deployerSigner).transferPoints(receiverAddress, 30, { nonce });
  await tx2.wait();
  console.log('After transfer - deployer:', (await contract.points(deployerAddress)).toString(), 'receiver:', (await contract.points(receiverAddress)).toString());

  return addr;
}

main()
  .then((addr) => {
    console.log('\nDone. Contract address:', addr);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
