import "hardhat-typechain";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@eth-optimism/hardhat-ovm";
import "./scripts/copy-uniswap-v3-artifacts.ts";
import "./tasks/hypervisor";
import "hardhat-contract-sizer";
import { parseUnits } from "ethers/lib/utils";
require("dotenv").config();
const mnemonic = process.env.DEV_MNEMONIC || "";
const archive_node = process.env.ETHEREUM_ARCHIVE_URL || "";

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    optimism_kovan: {
      url: `https://kovan.optimism.io`,
      accounts: [process.env.DEV_NET],
      gasPrice: 15000000,
      ovm: true,
    },
    Arbitrum_Testnet: {
      url: "https://rinkeby.arbitrum.io/rpc",
      accounts: {
        mnemonic,
      },
      gas: 7000000,
      gasPrice: 594242666,
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_ID,
      accounts: {
        mnemonic,
      },
      gasPrice: parseUnits("130", "gwei").toNumber(),
    },
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      accounts: {
        mnemonic,
      },
      // gasPrice: parseUnits('130', 'gwei').toNumber(),
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/" + process.env.INFURA_ID,
      accounts: {
        mnemonic,
      },
    },
  },
  watcher: {
    compilation: {
      tasks: ["compile"],
    },
  },
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  ovm: {
    // This version supports ETH opcodes:
    solcVersion: "0.7.6+commit.3b061308",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_APIKEY,
  },
  mocha: {
    timeout: 2000000,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
};
