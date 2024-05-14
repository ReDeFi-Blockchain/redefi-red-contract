import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import { secrets } from './secrets';

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    testnet: {
      url: 'http://127.0.0.1:9944',
      accounts: [secrets.privateKeys[0], secrets.privateKeys[1], secrets.privateKeys[2]]
    },
    testredefi: {
      url: 'https://test-layer1.redefi.world',
      accounts: [secrets.privateKeys[0], secrets.privateKeys[1], secrets.privateKeys[2]]
    },
    // sepolia: {
    //   url: `https://sepolia.infura.io/v3/${secrets.api_key}`,
    //   accounts: [secrets.privateKeys[4], secrets.privateKeys[5], secrets.privateKeys[6]]
    // },
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
