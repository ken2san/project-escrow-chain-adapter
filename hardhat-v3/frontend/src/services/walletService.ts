import { ethers } from 'ethers';

export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(): Promise<{ address: string; provider: ethers.BrowserProvider }> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Ensure we're on the correct network (Hardhat Local - Chain ID 31337)
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x7A69',
            chainName: 'Hardhat Local',
            rpcUrls: ['http://127.0.0.1:8545'],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            }
          }]
        });
      } else {
        throw switchError;
      }
    }

    // Create fresh provider
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    const address = await this.signer.getAddress();

    // Check network
    const network = await this.provider.getNetwork();
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
    console.log(`Connected address: ${address}`);

    // Verify we're on the correct network
    if (Number(network.chainId) !== 31337) {
      throw new Error(`Wrong network! Expected chainId 31337, got ${network.chainId}`);
    }

    return { address, provider: this.provider };
  }  async switchAccount(): Promise<{ address: string; provider: ethers.BrowserProvider }> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    // Request to switch accounts
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    });

    // Reconnect with new account
    return await this.connectWallet();
  }

  async getAvailableAccounts(): Promise<string[]> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    return await window.ethereum.request({ method: 'eth_accounts' });
  }

  async getSigner(): Promise<ethers.JsonRpcSigner> {
    if (!this.signer) {
      await this.connectWallet();
    }
    return this.signer!;
  }

  async getProvider(): Promise<ethers.BrowserProvider> {
    if (!this.provider) {
      await this.connectWallet();
    }
    return this.provider!;
  }

  async getAddress(): Promise<string> {
    const signer = await this.getSigner();
    return await signer.getAddress();
  }

  async getBalance(address?: string): Promise<string> {
    try {
      // Always use fresh provider to ensure we're using current MetaMask network
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const targetAddress = address || await this.getAddress();

      console.log(`Getting balance for ${targetAddress}...`);
      const balance = await provider.getBalance(targetAddress);
      const ethBalance = ethers.formatEther(balance);
      console.log(`Balance result: ${ethBalance} ETH`);

      return ethBalance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0.0';
    }
  }
}

// Global instance
export const walletService = new WalletService();