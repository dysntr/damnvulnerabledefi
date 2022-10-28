const { web3 } = require("@openzeppelin/test-environment")
//const { ethers } = require("hardhat")
// Taken (and adapted) from https://github.com/gnosis/safe-contracts/blob/v1.1.1/test/utils/general.js#L9

const ModuleDataWrapper = new web3.eth.Contract([
    {
        constant: false,
        inputs: [{ name: "data", type: "bytes" }],
        name: "setup",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
])

function createAndAddModulesData(dataArray) {
    // Remove method id (10) and position of data in payload (64)
    return dataArray.reduce(
        (acc, data) => acc + ModuleDataWrapper.methods.setup(data).encodeABI().substr(74),
        "0x"
    )
}

Object.assign(exports, {
    createAndAddModulesData,
})
