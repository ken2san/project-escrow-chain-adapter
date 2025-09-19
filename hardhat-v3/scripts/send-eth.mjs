// Send ETH to imported address to make it usable
import { ethers } from 'ethers';

async function main() {
  // Connect to local node
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

  // Get the first signer (Account #0 with lots of ETH)
  const accounts = await provider.listAccounts();
  const signer = await provider.getSigner(accounts[0].address);

  const targetAddress = '0xbD3e33013aA42e6835146f726aE5B0Ad745Cc453';
  const amount = ethers.parseEther('100'); // Send 100 ETH

  console.log(`Sending 100 ETH from ${signer.address} to ${targetAddress}...`);

  const tx = await signer.sendTransaction({
    to: targetAddress,
    value: amount
  });

  await tx.wait();

  // Check balance
  const balance = await provider.getBalance(targetAddress);
  const ethBalance = ethers.formatEther(balance);

  console.log(`✅ Transaction completed!`);
  console.log(`New balance of ${targetAddress}: ${ethBalance} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });