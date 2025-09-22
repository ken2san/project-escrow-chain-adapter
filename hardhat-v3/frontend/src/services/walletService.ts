import { ethers } from 'ethers';

// Minimal wallet service used by the frontend.
// - Prefer injected `window.ethereum` (MetaMask).
// - If not available, fall back to DEV_PK0 (from window.__DEV_PK0__ or REACT_APP_DEV_PK0) against localhost RPC.

export class WalletService {
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
  private signer: any = null;

  async connectWallet(): Promise<{ address: string; provider: any }> {
    const eth = (window as any).ethereum;

    if (eth) {
      await eth.request({ method: 'eth_requestAccounts' });

      try {
        await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x7A69' }] });
      } catch (err: any) {
        if (err && err.code === 4902) {
          await eth.request({ method: 'wallet_addEthereumChain', params: [{
            chainId: '0x7A69',
            chainName: 'Hardhat Local',
            rpcUrls: ['http://127.0.0.1:8545'],
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
          }] });
        }
      }

      this.provider = new ethers.BrowserProvider(eth);
      this.signer = await this.provider.getSigner();

      const addr = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
      console.log(`Connected address: ${addr}`);

      if (Number(network.chainId) !== 31337) {
        throw new Error(`Wrong network! Expected chainId 31337, got ${network.chainId}`);
      }

      return { address: addr, provider: this.provider } as any;
    }

    // Fallback: use DEV private key against local Hardhat RPC
    const devPk = (window as any).__DEV_PK0__ || (process && (process as any).env && (process as any).env.REACT_APP_DEV_PK0) || (window as any).REACT_APP_DEV_PK0;
    if (!devPk) throw new Error('No Ethereum provider found and DEV_PK0 not provided.');

    const rpcUrl = 'http://127.0.0.1:8545';
    const jsonProvider: any = new ethers.JsonRpcProvider(rpcUrl);
    const wallet: any = new ethers.Wallet(devPk, jsonProvider);

    this.provider = jsonProvider;
    this.signer = wallet;

    const addr2 = await this.signer.getAddress();
    console.log(`Fallback signer address (DEV_PK0): ${addr2}`);
    return { address: addr2, provider: this.provider } as any;
  }

  async switchAccount(): Promise<{ address: string; provider: any }> {
    const eth = (window as any).ethereum;
    if (!eth) return await this.connectWallet();
    await eth.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
    return await this.connectWallet();
  }

  async getAvailableAccounts(): Promise<string[]> {
    const eth = (window as any).ethereum;
    if (!eth) {
      if (this.signer) return [await this.signer.getAddress()];
      return [];
    }
    return await eth.request({ method: 'eth_accounts' });
  }

  async getSigner(): Promise<any> {
    if (!this.signer) await this.connectWallet();
    return this.signer as any;
  }

  async getProvider(): Promise<any> {
    if (!this.provider) await this.connectWallet();
    return this.provider as any;
  }

  async getAddress(): Promise<string> {
    const s = await this.getSigner();
    return await s.getAddress();
  }

  async getBalance(address?: string): Promise<string> {
    try {
      const p = (window as any).ethereum ? new ethers.BrowserProvider((window as any).ethereum) : new ethers.JsonRpcProvider('http://127.0.0.1:8545');
      const target = address || await this.getAddress();
      const bal = await p.getBalance(target);
      return ethers.formatEther(bal);
    } catch (e) {
      console.error('Error getting balance', e);
      return '0.0';
    }
  }
}

export const walletService = new WalletService();