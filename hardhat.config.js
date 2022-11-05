require('@nomicfoundation/hardhat-toolbox');
require('hardhat-gas-reporter');
require('@nomiclabs/hardhat-etherscan');
require('solidity-coverage');
require('hardhat-deploy');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */

const {
  GOERLI_RPC_URL = '',
  PRIVATE_KEY = '',
  ETHERSCAN_API_KEY = '',
  COINMARKETCAP_API_KEY = '',
} = process.env;

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.8',
      },
      {
        version: '0.6.6',
      },
    ],
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
    // token: 'MATIC', // prise in MATIC
    token: 'ETH', // prise in ETH
  },
  namedAccounts: {
    deployer: {
      default: 0, // Here this will by default take the first account as deployer.
      1: 0, // Similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another.
    },
    user: {
      default: 1,
    },
  },
  mocha: {
    timeout: 500000,
  },
};
