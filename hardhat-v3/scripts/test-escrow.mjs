// Test script that runs via `npx hardhat run` instead of `npx hardhat test`
// This bypasses the HHE1200 issue with hardhat-mocha plugin

import { ethers } from 'ethers';
import fs from 'fs/promises';

async function main() {
  console.log('\n🧪 Starting Escrow Contract Tests...\n');

  // Connect to local Hardhat node
  const rpc = 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpc);

  // Get test accounts
  const accounts = await provider.listAccounts();
  console.log(`📋 Found ${accounts.length} test accounts`);

  const deployer = await provider.getSigner(accounts[0].address);
  const user1 = await provider.getSigner(accounts[1]?.address || accounts[0].address);
  const user2 = await provider.getSigner(accounts[2]?.address || accounts[0].address);

  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`👤 User1: ${user1.address}`);
  console.log(`👤 User2: ${user2.address}\n`);

  // Read and deploy contract
  console.log('📦 Deploying Escrow contract...');
  const artifactPath = 'artifacts/contracts/Escrow.sol/Escrow.json';
  const artifactJson = await fs.readFile(artifactPath, 'utf8');
  const artifact = JSON.parse(artifactJson);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  const escrow = await factory.deploy();
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log(`✅ Contract deployed at: ${address}\n`);

  // Test counter
  let testsPassed = 0;
  let totalTests = 0;

  // Helper function for assertions
  function assertEqual(actual, expected, testName) {
    totalTests++;
    if (actual.toString() === expected.toString()) {
      console.log(`✅ ${testName}`);
      testsPassed++;
    } else {
      console.log(`❌ ${testName} - Expected: ${expected}, Got: ${actual}`);
    }
  }

  function assertMatch(value, pattern, testName) {
    totalTests++;
    if (pattern.test(value)) {
      console.log(`✅ ${testName}`);
      testsPassed++;
    } else {
      console.log(`❌ ${testName} - Value ${value} doesn't match pattern ${pattern}`);
    }
  }

  // Test 1: Contract deployment
  console.log('🔍 Testing contract deployment...');
  assertMatch(address, /^0x[a-fA-F0-9]{40}$/, 'Contract address format is valid');

  // Test 2: Initial points should be zero
  console.log('\n🔍 Testing initial state...');
  const initialPoints = await escrow.points(user1.address);
  assertEqual(initialPoints, 0n, 'Initial points should be zero');

  // Test 3: Award points
  console.log('\n🔍 Testing point awarding...');
  const awardAmount = 100n;
  await escrow.awardPoints(deployer.address, awardAmount);
  const deployerPoints = await escrow.points(deployer.address);
  assertEqual(deployerPoints, awardAmount, 'Points awarded correctly');

  // Test 4: Transfer points
  console.log('\n🔍 Testing point transfers...');
  const transferAmount = 30n;
  await escrow.transferPoints(user1.address, transferAmount);

  const deployerPointsAfter = await escrow.points(deployer.address);
  const user1PointsAfter = await escrow.points(user1.address);

  assertEqual(deployerPointsAfter, awardAmount - transferAmount, 'Deployer points reduced correctly');
  assertEqual(user1PointsAfter, transferAmount, 'User1 received points correctly');

  // Test 5: Multiple transfers
  console.log('\n🔍 Testing multiple transfers...');
  await escrow.awardPoints(deployer.address, 200n); // Top up deployer
  await escrow.transferPoints(user2.address, 50n);

  const user2Points = await escrow.points(user2.address);
  assertEqual(user2Points, 50n, 'User2 received points from second transfer');

  // Test 6: Verify zero points validation
  console.log('\n🔍 Testing edge cases...');
  try {
    await escrow.awardPoints(user2.address, 0n);
    console.log('❌ Zero point award should have failed but succeeded');
  } catch (error) {
    if (error.message.includes('Amount must be greater than zero') || error.code === 'CALL_EXCEPTION') {
      console.log('✅ Zero point award correctly rejected by contract');
      testsPassed++;
    } else {
      console.log(`❌ Zero point award failed with unexpected error: ${error.message}`);
    }
    totalTests++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${testsPassed}/${totalTests} tests passed`);

  if (testsPassed === totalTests) {
    console.log('🎉 All tests passed! Contract is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }

  console.log('='.repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });