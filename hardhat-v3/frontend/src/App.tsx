import React, { useState, useEffect } from 'react';
import './App.css';
import { walletService } from './services/walletService';
import { escrowService } from './services/escrowService';
import { TRANSACTION_STATES } from './types/contracts';

function App() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [points, setPoints] = useState<string>('0');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Transaction form states
  const [sellerAddress, setSellerAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');

  // Points form states
  const [pointsToAddress, setPointsToAddress] = useState<string>('');
  const [pointsAmount, setPointsAmount] = useState<string>('');

  const connectWallet = async () => {
    try {
      const { address } = await walletService.connectWallet();
      setWalletAddress(address);
      const bal = await walletService.getBalance();
      setBalance(bal);
    const switchAccount = async () => {
              <button onClick={switchAccount} style={{marginTop: '10px', padding: '8px 16px'}}>
                Switch Account
              </button>
      try {
        const { address } = await walletService.switchAccount();
        await updatePoints(); // Update points for new account
        alert(`Switched to account: ${address}`);
      } catch (error) {
        console.error('Failed to switch account:', error);
        alert('Failed to switch account');
      }
    };
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please install MetaMask.');
    }
  };

  const connectContract = async () => {
    if (!contractAddress) {
      alert('Please enter contract address');
      return;
    }
    try {
      await escrowService.connectToContract(contractAddress);
      await updatePoints();
      alert('Connected to contract successfully!');
    } catch (error) {
      console.error('Failed to connect to contract:', error);
      alert('Failed to connect to contract');
    }
  };

  const updatePoints = async () => {
    if (walletAddress && contractAddress) {
      try {
        const userPoints = await escrowService.getPoints(walletAddress);
        setPoints(userPoints.toString());
      } catch (error) {
        console.error('Failed to get points:', error);
      }
    }
  };

  const createTransaction = async () => {
    if (!sellerAddress || !amount) {
      alert('Please fill in seller address and amount');
      return;
    }
    try {
      await escrowService.createTransaction(sellerAddress, amount);
      alert('Transaction created successfully!');
      const bal = await walletService.getBalance();
      setBalance(bal);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction');
    }
  };

  const transferPoints = async () => {
    if (!pointsToAddress || !pointsAmount) {
      alert('Please fill in recipient address and points amount');
      return;
    }
    try {
      await escrowService.transferPoints(pointsToAddress, parseInt(pointsAmount));
      alert('Points transferred successfully!');
      await updatePoints();
    } catch (error) {
      console.error('Failed to transfer points:', error);
      alert('Failed to transfer points');
    }
  };

  const awardPoints = async () => {
    if (!pointsToAddress || !pointsAmount) {
      alert('Please fill in recipient address and points amount');
      return;
    }
    try {
      await escrowService.awardPoints(pointsToAddress, parseInt(pointsAmount));
      alert('Points awarded successfully!');
      await updatePoints();
    } catch (error) {
      console.error('Failed to award points:', error);
      alert('Failed to award points');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔒 Escrow DApp with Points System</h1>

        {!isConnected ? (
          <div>
            <button onClick={connectWallet} style={{padding: '10px 20px', fontSize: '16px'}}>
              Connect MetaMask Wallet
            </button>
          </div>
        ) : (
          <div>
            <div style={{marginBottom: '20px'}}>
              <p><strong>Wallet:</strong> {walletAddress}</p>
              <p><strong>Balance:</strong> {balance} ETH</p>
              <p><strong>Points:</strong> {points}</p>
            </div>

            <div style={{marginBottom: '30px'}}>
              <h3>Contract Connection</h3>
              <input
                type="text"
                placeholder="Enter contract address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                style={{padding: '8px', width: '400px', marginRight: '10px'}}
              />
              <button onClick={connectContract}>Connect to Contract</button>
            </div>

            {contractAddress && (
              <>
                <div style={{marginBottom: '30px'}}>
                  <h3>Create Escrow Transaction</h3>
                  <input
                    type="text"
                    placeholder="Seller address"
                    value={sellerAddress}
                    onChange={(e) => setSellerAddress(e.target.value)}
                    style={{padding: '8px', width: '300px', marginRight: '10px'}}
                  />
                  <input
                    type="text"
                    placeholder="Amount in ETH"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{padding: '8px', width: '150px', marginRight: '10px'}}
                  />
                  <button onClick={createTransaction}>Create Transaction</button>
                </div>

                <div style={{marginBottom: '30px'}}>
                  <h3>Points Management</h3>
                  <input
                    type="text"
                    placeholder="Recipient address"
                    value={pointsToAddress}
                    onChange={(e) => setPointsToAddress(e.target.value)}
                    style={{padding: '8px', width: '300px', marginRight: '10px'}}
                  />
                  <input
                    type="text"
                    placeholder="Points amount"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(e.target.value)}
                    style={{padding: '8px', width: '150px', marginRight: '10px'}}
                  />
                  <button onClick={transferPoints} style={{marginRight: '10px'}}>Transfer Points</button>
                  <button onClick={awardPoints}>Award Points</button>
                </div>

                <button onClick={updatePoints}>Refresh Points</button>
              </>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
