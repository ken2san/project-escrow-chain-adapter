import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-mocha";
import type { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  mocha: {
    timeout: 40000,
    spec: "test/**/*.js"
  },
  paths: {
    tests: "./test"
  }
};

export default config;
