import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const deployer = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

  const projectRoot = path.join(__dirname, '..');
  const configPath = path.join(projectRoot, 'frontend', 'src', 'deployed-contracts.json');
  if (!fs.existsSync(configPath)) throw new Error('Config not found');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const contractAddress = config.Escrow.address;

  const artifactPath = path.join(projectRoot, 'artifacts', 'contracts', 'Escrow.sol', 'Escrow.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const escrow = new ethers.Contract(contractAddress, artifact.abi, deployer);

  const target = '0xbD3e33013aA42e6835146f726aE5B0Ad745Cc453';
  const points = 50;

  // get current nonce from network and use it explicitly to avoid automining queue issues
  const nonce = await provider.getTransactionCount(deployer.address);
  console.log('Using nonce', nonce, 'for deployer', deployer.address);

  const tx = await escrow.awardPoints(target, points, { nonce });
  console.log('Sent tx', tx.hash);
  const receipt = await tx.wait();
  console.log('Confirmed in block', receipt.blockNumber);

  const current = await escrow.points(target);
  console.log('Current points for', target, ':', current.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
