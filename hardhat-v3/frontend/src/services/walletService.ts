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

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    const address = await this.signer.getAddress();

    return { address, provider: this.provider };
  }

  async switchAccount(): Promise<{ address: string; provider: ethers.BrowserProvider }> {
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

  async getBalance(): Promise<string> {
    const address = await this.getAddress();
    const provider = await this.getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}

// Global instance
export const walletService = new WalletService();