import fs from 'fs/promises';
import path from 'path';
import { ethers } from 'ethers';

const RPC = process.env.RPC_URL || 'http://127.0.0.1:8545';
const OUT_SRC = path.resolve('../frontend/src/deployed-contracts.json');
const OUT_PUBLIC = path.resolve('../frontend/public/deployed-contracts.json');

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);

  // Choose signer: prefer DEV_MNEMONIC via Wallet from mnemonic, else use provider.getSigner(0)
  let signer;
  if (process.env.DEV_MNEMONIC) {
    // Use Wallet.fromPhrase for broad compatibility with ethers versions
    signer = ethers.Wallet.fromPhrase(process.env.DEV_MNEMONIC).connect(provider);
  } else if (process.env.DEV_PK0) {
    signer = new ethers.Wallet(process.env.DEV_PK0, provider);
  } else {
    signer = provider.getSigner(0);
  }

  // Read artifact
  const artifactPath = path.resolve('artifacts/contracts/Escrow.sol/Escrow.json');
  const artifactJson = await fs.readFile(artifactPath, 'utf8');
  const artifact = JSON.parse(artifactJson);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  console.log('Deploying Escrow...');
  const escrow = await factory.deploy();
  await escrow.waitForDeployment?.();
  const address = escrow.target ?? escrow.address;
  console.log('Deployed Escrow at', address);

  // Build output JSON
  const chainId = Number((await provider.getNetwork()).chainId);
  const out = {
    chainId,
    networkName: 'localhost',
    deployedAt: new Date().toISOString(),
    contracts: [
      {
        name: 'Escrow',
        address,
        abi: artifact.abi,
      },
    ],
    defaultAccounts: [],
  };

  try {
    const accounts = await provider.listAccounts();
    out.defaultAccounts = accounts.slice(0, 10);
  } catch (e) {
    // ignore
  }

  // Ensure frontend paths exist
  await fs.mkdir(path.dirname(OUT_SRC), { recursive: true });
  await fs.mkdir(path.dirname(OUT_PUBLIC), { recursive: true });

  await fs.writeFile(OUT_SRC, JSON.stringify(out, null, 2), 'utf8');
  await fs.writeFile(OUT_PUBLIC, JSON.stringify(out, null, 2), 'utf8');

  console.log('Wrote deployed-contracts.json to frontend/src and frontend/public');
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
