//require("@nomicfoundation/hardhat-toolbox") //needed for tasks
require("@nomiclabs/hardhat-etherscan") //needed for verify
require("dotenv").config()
require("hardhat-gas-reporter") //gas reporter
require("solidity-coverage") //solidity test coverage
require("@nomiclabs/hardhat-waffle")
require("hardhat-deploy")
require("hardhat-contract-sizer")
//require("./tasks/accounts")

/** @type import('hardhat/config').HardhatUserConfig */

const MAINNET_RPC_URL =
    process.env.MAINNET_RPC_URL ||
    process.env.ALCHEMY_MAINNET_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
const GOERLI_RPC_URL =
    process.env.GOERLI_RPC_URL || "https://eth-goerli.alchemyapi.io/v2/your-api-key"
const POLYGON_MAINNET_RPC_URL =
    process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-mainnet.alchemyapi.io/v2/your-api-key"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"
// optional
const MNEMONIC = process.env.MNEMONIC || "your mnemonic"

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "Your polygonscan API key"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,

            blockConfirmations: 6, //used in deploy
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
            blockConfirmations: 6, //used in deploy
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6, //used in deploy
            gas: 6000000,
        },
        mainnet: {
            url: MAINNET_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            //   accounts: {
            //     mnemonic: MNEMONIC,
            //   },
            saveDeployments: true,
            chainId: 1,
            blockConfirmations: 6, //used in deploy
        },
        polygon: {
            url: POLYGON_MAINNET_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            saveDeployments: true,
            chainId: 137,
            blockConfirmations: 6, //used in deploy
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
        ],
    },
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
            polygon: POLYGONSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },

    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on ETHmainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
            4: 1, // eg. on rinkby you can use account 4.
        },
        user: {
            default: 3,
        },
    },
}
