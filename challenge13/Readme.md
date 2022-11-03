# Challenge #13 - Safe miners

Watchout! This challenge is being heavily reworked for the upcoming v3 version of Damn Vulnerable DeFi. You'd better wait for the new version before solving it.

Somebody has sent +2 million DVT tokens to 0x79658d35aB5c38B6b988C23D02e0410A380B8D5c. But the address is empty, isn't it?

To pass this challenge, you have to take all tokens out.

You may need to use prior knowledge, safely.

-   [Complete the challenge](https://www.damnvulnerabledefi.xyz/challenges/13.html)

# Solution

This revolves around attack replay for create function. You can compute the create() address using the `await getContractAddress(deployerAddress, i)` method.

In this challenge a lot of details were left out. It's based on the wintermute OP hack [https://inspexco.medium.com/how-20-million-op-was-stolen-from-the-multisig-wallet-not-yet-owned-by-wintermute-3f6c75db740a](link). The address `0x79658d35aB5c38B6b988C23D02e0410A380B8D5c` is actually an address of a contract that is deployed by the attacker's deployed contract.

I wrote a function to compute the addresses that were deployed by contracts that were deployed by the attacker.
