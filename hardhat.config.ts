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
    testredefi: {
      url: "http://test.redefi.world/rpc",
      accounts: [secrets.privateKeys[0], secrets.privateKeys[1], secrets.privateKeys[2]]
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${secrets.api_key}`,
      accounts: [secrets.privateKeys[4], secrets.privateKeys[5], secrets.privateKeys[6]]
    },
    ethereum: {
      url: `https://mainnet.infura.io/v3/${secrets.api_key}`,
      accounts: [secrets.privateKeys[4], secrets.privateKeys[5], secrets.privateKeys[6]]
    },
  },
  etherscan: {
    apiKey: secrets.etherscan_api_key,
  },
  sourcify: {
    enabled: true
  },
  mocha: {
    timeout: 300000
  },
};

export default config;
