import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import { secrets } from "./secrets";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
    },
    testnet: {
      url: 'http://127.0.0.1:9944',
      accounts: [secrets.privateKeys[0], secrets.privateKeys[1], secrets.privateKeys[2]]
    },
    testredefi: {
      url: 'https://test-layer1.redefi.world',
      timeout: 30000,
      accounts: [secrets.privateKeys[0], secrets.privateKeys[1], secrets.privateKeys[2]]
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${secrets.apiKey}`,
      accounts: [secrets.privateKeys[0], secrets.privateKeys[1], secrets.privateKeys[2]]
    },
    ganache: {
      url: "http://0.0.0.0:8545",
      accounts: ["0x0aad591a56ecceeac1505c482809cd716a2ffebd5193505b4b8cce58c5a5583c"]
    },
    ethereum: {
      url: `https://mainnet.infura.io/v3/${secrets.apiKey}`,
      accounts: [secrets.privateKeys[0], secrets.privateKeys[1], secrets.privateKeys[2]]
    },
  },
  etherscan: {
    apiKey: secrets.etherscanApiKey,
  },
  sourcify: {
    enabled: true
  },
  mocha: {
    timeout: 300000
  },
};

export default config;
