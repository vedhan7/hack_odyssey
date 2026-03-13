import dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    artifacts: "./src/data/abi",
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    polygonAmoy: {
      url: process.env.VITE_POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      // Only require private key if we are actually deploying to live testnet
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
