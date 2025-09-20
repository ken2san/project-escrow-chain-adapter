import React, { useState } from 'react';
import './App.css';
import { walletService } from './services/walletService';
import { escrowService } from './services/escrowService';
import { ethers } from 'ethers';

interface User {
  address: string;
  balance: string;
  points: string;
  isConnected: boolean;
  signer?: ethers.JsonRpcSigner; // 各ユーザー専用のサイナーを保存
}

interface LogEntry {
  timestamp: string;
  type: 'transfer' | 'award' | 'connection' | 'error';
  message: string;
  from?: string;
  to?: string;
  amount?: string;
}

function App() {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<1 | 2>(1);

  const [user1, setUser1] = useState<User>({
    address: '',
    balance: '',
    points: '0',
    isConnected: false
  });

  const [user2, setUser2] = useState<User>({
    address: '',
    balance: '',
    points: '0',
    isConnected: false
  });

  const [transferAmount, setTransferAmount] = useState<string>('');
  const [awardAmount, setAwardAmount] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (entry: Omit<LogEntry, 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newEntry, ...prev]);
  };

  const connectUserWallet = async (userNumber: 1 | 2) => {
    try {
      console.log(`Connecting User ${userNumber}...`);
      const { address, provider } = await walletService.connectWallet();
      const signer = await provider.getSigner();
      console.log(`Connected address: ${address}`);

      const balance = await walletService.getBalance(address);
      console.log(`Balance for ${address}: ${balance} ETH`);

      const userData = {
        address,
        balance,
        points: '0',
        isConnected: true,
        signer // 各ユーザー専用のサイナーを保存
      };

      if (userNumber === 1) {
        setUser1(userData);
      } else {
        setUser2(userData);
      }

      setCurrentUser(userNumber);
      addLog({
        type: 'connection',
        message: `User ${userNumber} connected: ${address.slice(0, 6)}...${address.slice(-4)}`
      });

      // Update points if contract is connected
      if (contractAddress) {
        await updateUserPoints(userNumber, address);
      }
    } catch (error) {
      console.error(`Failed to connect User ${userNumber}:`, error);
      addLog({
        type: 'error',
        message: `Failed to connect User ${userNumber}`
      });
    }
  };

  const connectContract = async () => {
    if (!contractAddress) {
      addLog({ type: 'error', message: 'Please enter contract address' });
      return;
    }
    try {
      await escrowService.connectToContract(contractAddress);
      addLog({
        type: 'connection',
        message: `Connected to contract: ${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
      });

      // Update points for connected users
      if (user1.isConnected) await updateUserPoints(1, user1.address);
      if (user2.isConnected) await updateUserPoints(2, user2.address);
    } catch (error) {
      console.error('Failed to connect to contract:', error);
      addLog({ type: 'error', message: 'Failed to connect to contract' });
    }
  };

  const updateUserPoints = async (userNumber: 1 | 2, address: string) => {
    try {
      console.log(`Updating User ${userNumber} points for ${address}...`);
      const points = await escrowService.getPoints(address);
      const balance = await walletService.getBalance(address);
      console.log(`User ${userNumber} - Points: ${points}, Balance: ${balance} ETH`);

      if (userNumber === 1) {
        setUser1(prev => ({ ...prev, points: points.toString(), balance }));
      } else {
        setUser2(prev => ({ ...prev, points: points.toString(), balance }));
      }
    } catch (error) {
      console.error(`Failed to update User ${userNumber} points:`, error);
    }
  };

  const switchToUser = async (userNumber: 1 | 2) => {
    const user = userNumber === 1 ? user1 : user2;
    if (!user.isConnected) {
      addLog({ type: 'error', message: `User ${userNumber} not connected` });
      return;
    }

    try {
      // Switch to the user's account in MetaMask
      await walletService.switchAccount();
      setCurrentUser(userNumber);
      await updateUserPoints(userNumber, user.address);
      addLog({
        type: 'connection',
        message: `Switched to User ${userNumber}: ${user.address.slice(0, 6)}...${user.address.slice(-4)}`
      });
    } catch (error) {
      console.error('Failed to switch user:', error);
      addLog({ type: 'error', message: `Failed to switch to User ${userNumber}` });
    }
  };

  const transferPoints = async () => {
    if (!transferAmount || !contractAddress) {
      addLog({ type: 'error', message: 'Please enter transfer amount and connect to contract' });
      return;
    }

    const fromUser = currentUser === 1 ? user1 : user2;
    const toUser = currentUser === 1 ? user2 : user1;

    if (!fromUser.isConnected || !toUser.isConnected) {
      addLog({ type: 'error', message: 'Both users must be connected' });
      return;
    }

    if (!fromUser.signer) {
      addLog({ type: 'error', message: `User ${currentUser} signer not available` });
      return;
    }

    try {
      // 現在のユーザーのサイナーを使用してポイント転送
      console.log(`Transfer: User ${currentUser} (${fromUser.address}) -> User ${currentUser === 1 ? 2 : 1} (${toUser.address})`);
      await escrowService.transferPointsWithSigner(fromUser.signer, toUser.address, parseInt(transferAmount));

      addLog({
        type: 'transfer',
        message: `User ${currentUser} transferred ${transferAmount} points to User ${currentUser === 1 ? 2 : 1}`,
        from: fromUser.address,
        to: toUser.address,
        amount: transferAmount
      });

      // Update both users' points
      await updateUserPoints(1, user1.address);
      await updateUserPoints(2, user2.address);
      setTransferAmount('');
    } catch (error) {
      console.error('Failed to transfer points:', error);
      addLog({ type: 'error', message: 'Failed to transfer points' });
    }
  };

  const awardPointsToUser = async (userNumber: 1 | 2) => {
    if (!awardAmount || !contractAddress) {
      addLog({ type: 'error', message: 'Please enter award amount and connect to contract' });
      return;
    }

    const targetUser = userNumber === 1 ? user1 : user2;
    if (!targetUser.isConnected) {
      addLog({ type: 'error', message: `User ${userNumber} not connected` });
      return;
    }

    try {
      await escrowService.awardPoints(targetUser.address, parseInt(awardAmount));

      addLog({
        type: 'award',
        message: `Awarded ${awardAmount} points to User ${userNumber}`,
        to: targetUser.address,
        amount: awardAmount
      });

      await updateUserPoints(userNumber, targetUser.address);
      setAwardAmount('');
    } catch (error) {
      console.error('Failed to award points:', error);
      addLog({ type: 'error', message: 'Failed to award points' });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>� Two-User Point Exchange DApp</h1>

        {/* Contract Connection */}
        <div style={{marginBottom: '30px', padding: '20px', border: '2px solid #444', borderRadius: '10px'}}>
          <h3>📋 Contract Connection</h3>
          <input
            type="text"
            placeholder="Enter contract address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            style={{padding: '8px', width: '400px', marginRight: '10px'}}
          />
          <button onClick={connectContract}>Connect to Contract</button>
        </div>

        {/* Two User Panels */}
        <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
          {/* User 1 Panel */}
          <div style={{
            flex: 1,
            padding: '20px',
            border: currentUser === 1 ? '3px solid #4CAF50' : '2px solid #444',
            borderRadius: '10px',
            backgroundColor: currentUser === 1 ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
          }}>
            <h3>👤 User 1 {currentUser === 1 && '(Active)'}</h3>
            {!user1.isConnected ? (
              <button onClick={() => connectUserWallet(1)} style={{padding: '10px 20px'}}>
                Connect User 1 Wallet
              </button>
            ) : (
              <div>
                <p><strong>Address:</strong> {user1.address.slice(0, 6)}...{user1.address.slice(-4)}</p>
                <p><strong>Balance:</strong> {user1.balance} ETH</p>
                <p><strong>Points:</strong> {user1.points}</p>
                <button onClick={() => switchToUser(1)} disabled={currentUser === 1}>
                  Switch to User 1
                </button>
              </div>
            )}
          </div>

          {/* User 2 Panel */}
          <div style={{
            flex: 1,
            padding: '20px',
            border: currentUser === 2 ? '3px solid #4CAF50' : '2px solid #444',
            borderRadius: '10px',
            backgroundColor: currentUser === 2 ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
          }}>
            <h3>👤 User 2 {currentUser === 2 && '(Active)'}</h3>
            {!user2.isConnected ? (
              <button onClick={() => connectUserWallet(2)} style={{padding: '10px 20px'}}>
                Connect User 2 Wallet
              </button>
            ) : (
              <div>
                <p><strong>Address:</strong> {user2.address.slice(0, 6)}...{user2.address.slice(-4)}</p>
                <p><strong>Balance:</strong> {user2.balance} ETH</p>
                <p><strong>Points:</strong> {user2.points}</p>
                <button onClick={() => switchToUser(2)} disabled={currentUser === 2}>
                  Switch to User 2
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions Panel */}
        {(user1.isConnected || user2.isConnected) && contractAddress && (
          <div style={{marginBottom: '30px', padding: '20px', border: '2px solid #444', borderRadius: '10px'}}>
            <h3>🔄 Actions</h3>

            {/* Transfer Points */}
            <div style={{marginBottom: '20px'}}>
              <h4>Transfer Points (User {currentUser} → User {currentUser === 1 ? 2 : 1})</h4>
              <input
                type="number"
                placeholder="Points to transfer"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                style={{padding: '8px', width: '150px', marginRight: '10px'}}
              />
              <button onClick={transferPoints}>Transfer Points</button>
            </div>

            {/* Award Points */}
            <div style={{marginBottom: '20px'}}>
              <h4>Award Points</h4>
              <input
                type="number"
                placeholder="Points to award"
                value={awardAmount}
                onChange={(e) => setAwardAmount(e.target.value)}
                style={{padding: '8px', width: '150px', marginRight: '10px'}}
              />
              <button onClick={() => awardPointsToUser(1)} style={{marginRight: '10px'}}>
                Award to User 1
              </button>
              <button onClick={() => awardPointsToUser(2)}>
                Award to User 2
              </button>
            </div>

            {/* Debug Section */}
            <div>
              <h4>🔧 Debug</h4>
              <button onClick={async () => {
                if (user1.isConnected) await updateUserPoints(1, user1.address);
                if (user2.isConnected) await updateUserPoints(2, user2.address);
              }} style={{marginRight: '10px'}}>
                Refresh Balances & Points
              </button>
              <button onClick={async () => {
                const balance1 = await walletService.getBalance(user1.address);
                const balance2 = await walletService.getBalance(user2.address);
                console.log(`User 1 balance: ${balance1}`);
                console.log(`User 2 balance: ${balance2}`);
                addLog({ type: 'connection', message: `Debug: User1=${balance1}ETH, User2=${balance2}ETH` });
              }}>
                Check Balances (Console)
              </button>
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div style={{padding: '20px', border: '2px solid #444', borderRadius: '10px', textAlign: 'left'}}>
          <h3>📊 Activity Log</h3>
          <div style={{
            height: '200px',
            overflowY: 'auto',
            backgroundColor: '#1a1a1a',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'monospace'
          }}>
            {logs.length === 0 ? (
              <p style={{color: '#888'}}>No activity yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{
                  marginBottom: '5px',
                  color: log.type === 'error' ? '#ff6b6b' :
                        log.type === 'transfer' ? '#4ecdc4' :
                        log.type === 'award' ? '#ffe66d' : '#74b9ff'
                }}>
                  <span style={{color: '#888'}}>[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
