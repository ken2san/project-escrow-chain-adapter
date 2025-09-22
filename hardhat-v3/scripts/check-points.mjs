import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

  const projectRoot = path.join(__dirname, '..');
  const configPath = path.join(projectRoot, 'frontend', 'src', 'deployed-contracts.json');
  if (!fs.existsSync(configPath)) throw new Error('deployed-contracts.json not found');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const contractAddress = config.Escrow?.address;
  if (!contractAddress) throw new Error('Escrow address missing in config');

  const artifactPath = path.join(projectRoot, 'artifacts', 'contracts', 'Escrow.sol', 'Escrow.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const escrow = new ethers.Contract(contractAddress, artifact.abi, provider);

  const users = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0xbD3e33013aA42e6835146f726aE5B0Ad745Cc453'
  ];

  for (const u of users) {
    const pts = await escrow.points(u);
    console.log(`${u} -> ${pts.toString()} points`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
