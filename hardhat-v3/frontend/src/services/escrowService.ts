import { ethers } from 'ethers';
import { walletService } from './walletService';
import { Transaction } from '../types/contracts';

// Escrow contract ABI (simplified for main functions)
const ESCROW_ABI = [
  "function createTransaction(address payable _seller) public payable",
  "function releaseFunds(uint256 _transactionId) public",
  "function refundFunds(uint256 _transactionId) public",
  "function awardPoints(address _to, uint256 _amount) public",
  "function transferPoints(address _to, uint256 _amount) public",
  "function transactions(uint256) public view returns (address buyer, address seller, uint256 amount, uint8 state)",
  "function points(address) public view returns (uint256)",
  "function nextTransactionId() public view returns (uint256)",
  "event TransactionCreated(uint256 transactionId, address buyer, address seller, uint256 amount)",
  "event FundsReleased(uint256 transactionId)",
  "event FundsRefunded(uint256 transactionId)",
  "event PointsAwarded(address indexed to, uint256 amount)",
  "event PointsTransferred(address indexed from, address indexed to, uint256 amount)"
];

export class EscrowService {
  private contract: ethers.Contract | null = null;
  private contractAddress: string = '';

  async deployContract(): Promise<string> {
    // Contract bytecode (you would get this from hardhat compilation)
    // For now, we'll assume the contract is already deployed
    // In a real app, you'd either deploy here or use a pre-deployed address

    throw new Error('Contract deployment not implemented yet. Please provide deployed contract address.');
  }

  async connectToContract(contractAddress: string): Promise<void> {
    const signer = await walletService.getSigner();
    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(contractAddress, ESCROW_ABI, signer);
  }

  async createTransaction(sellerAddress: string, amountInEther: string): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const value = ethers.parseEther(amountInEther);
    const tx = await this.contract.createTransaction(sellerAddress, { value });
    return await tx.wait();
  }

  async releaseFunds(transactionId: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const tx = await this.contract.releaseFunds(transactionId);
    return await tx.wait();
  }

  async refundFunds(transactionId: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const tx = await this.contract.refundFunds(transactionId);
    return await tx.wait();
  }

  async awardPoints(toAddress: string, amount: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    // Get fresh signer to ensure we're using the current MetaMask account
    const signer = await walletService.getSigner();
    const contract = new ethers.Contract(this.contractAddress, ESCROW_ABI, signer);

    const tx = await contract.awardPoints(toAddress, amount);
    return await tx.wait();
  }

  async transferPointsWithSigner(signer: ethers.JsonRpcSigner, toAddress: string, amount: number): Promise<any> {
    if (!this.contractAddress) throw new Error('Contract not connected');

    const fromAddress = await signer.getAddress();

    // 指定されたサイナーでコントラクトを作成
    const contract = new ethers.Contract(this.contractAddress, ESCROW_ABI, signer);

    // Check sender's points balance
    const currentPoints = await contract.points(fromAddress);
    console.log(`Transfer attempt: ${fromAddress} has ${currentPoints} points, trying to transfer ${amount}`);

    if (Number(currentPoints) < amount) {
      throw new Error(`Insufficient points! You have ${currentPoints} points but trying to transfer ${amount}`);
    }

    const tx = await contract.transferPoints(toAddress, amount);
    return await tx.wait();
  }

  async transferPoints(toAddress: string, amount: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    // Get fresh signer to ensure we're using the current MetaMask account
    const signer = await walletService.getSigner();
    const fromAddress = await signer.getAddress();

    // Recreate contract with current signer
    const contract = new ethers.Contract(this.contractAddress, ESCROW_ABI, signer);

    // Check sender's points balance
    const currentPoints = await contract.points(fromAddress);
    console.log(`Transfer attempt: ${fromAddress} has ${currentPoints} points, trying to transfer ${amount}`);

    if (Number(currentPoints) < amount) {
      throw new Error(`Insufficient points! You have ${currentPoints} points but trying to transfer ${amount}`);
    }

    const tx = await contract.transferPoints(toAddress, amount);
    return await tx.wait();
  }  async getTransaction(transactionId: number): Promise<Transaction> {
    if (!this.contractAddress) throw new Error('Contract not connected');

    const signer = await walletService.getSigner();
    const contract = new ethers.Contract(this.contractAddress, ESCROW_ABI, signer);
    const result = await contract.transactions(transactionId);
    return {
      buyer: result.buyer,
      seller: result.seller,
      amount: result.amount,
      state: result.state
    };
  }

  async getPoints(address: string): Promise<bigint> {
    if (!this.contractAddress) throw new Error('Contract not connected');

    // Get fresh signer and recreate contract to ensure current connection
    const signer = await walletService.getSigner();
    if (!signer) throw new Error('Wallet not connected');

    const contract = new ethers.Contract(this.contractAddress, ESCROW_ABI, signer);
    console.log('🔗 Getting points for address:', address, 'from contract:', this.contractAddress);

    const points = await contract.points(address);
    console.log('📊 Points retrieved:', points.toString(), 'for address:', address);

    return points;
  }

  async getNextTransactionId(): Promise<number> {
    if (!this.contractAddress) throw new Error('Contract not connected');

    const signer = await walletService.getSigner();
    const contract = new ethers.Contract(this.contractAddress, ESCROW_ABI, signer);
    const result = await contract.nextTransactionId();
    return Number(result);
  }
}

// Global instance
export const escrowService = new EscrowService();