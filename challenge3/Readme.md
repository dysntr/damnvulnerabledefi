# Challenge #3 - Truster

More and more lending pools are offering flash loans. In this case, a new pool has launched that is offering flash loans of DVT tokens for free.

Currently the pool has 1 million DVT tokens in balance. And you have nothing.

But don't worry, you might be able to take them all from the pool. In a single transaction.

    [See the contracts](https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/truster)
    [Complete the challenge](https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/truster/truster.challenge.js)

# Solution

The vulnerability in this code is in the `flashLoan` function, specifically, the line `target.functionCall(data);`. This line allows an attacker to specify the target and the calldata for a function call from the contexts of the loan contract. An attacker can specify the target as the ERC20 token address. By crafting the calldata to call the ERC20 approve() function with the attacker's address. Following this, the attacker can perform a `transferFrom(TrusterLenderPool.Address, attacker.address,POOL_TOKEN_BALANCE)`, to drain the pool.
