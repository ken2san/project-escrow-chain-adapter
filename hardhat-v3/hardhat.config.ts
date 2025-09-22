console.log('[hardhat-config] loading hardhat-v3/hardhat.config.ts');
import "@nomicfoundation/hardhat-ethers";
console.log('[hardhat-config] imported @nomicfoundation/hardhat-ethers');
import "@nomicfoundation/hardhat-mocha";
console.log('[hardhat-config] imported @nomicfoundation/hardhat-mocha');
import "@nomicfoundation/hardhat-ignition";
console.log('[hardhat-config] imported @nomicfoundation/hardhat-ignition');
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      // Pin deterministic accounts via DEV_MNEMONIC env var for reproducible local dev
      accounts: {
        mnemonic: process.env.DEV_MNEMONIC || "test test test test test test test test test test test junk"
      }
    }
  },
  paths: {
    tests: {
      mocha: path.resolve(__dirname, "test")
    }
  },
  test: {
    mocha: {
      spec: "test/**/*.test.mjs"
    }
  }
};
