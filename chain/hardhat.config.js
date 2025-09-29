require('dotenv').config({ path: process.env.DOTENV_PATH || '../.env' })
require('@nomicfoundation/hardhat-toolbox')
require('@openzeppelin/hardhat-upgrades')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.29',
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  networks: {
    localhost: {
      url: process.env.HARDHAT_RPC_URL || 'http://127.0.0.1:8545'
    },
    hemiSepolia: {
      url: process.env.HEMI_SEPOLIA_RPC_URL || 'https://sepolia.rpc.hemi.network',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 743111,
    },
    hemiMainnet: {
      url: process.env.HEMI_MAINNET_RPC_URL || 'https://rpc.hemi.network',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 43111,
    }
  }
}


