console.log('[hardhat-config] loading hardhat-v3/hardhat.config.ts');
import "@nomicfoundation/hardhat-ethers";
console.log('[hardhat-config] imported @nomicfoundation/hardhat-ethers');
import "@nomicfoundation/hardhat-mocha";
console.log('[hardhat-config] imported @nomicfoundation/hardhat-mocha');
import "@nomicfoundation/hardhat-ignition";
console.log('[hardhat-config] imported @nomicfoundation/hardhat-ignition');

export default {
  solidity: "0.8.28",
  mocha: {
    spec: "test/**/*.test.{js,mjs,cjs}"
  }
};
