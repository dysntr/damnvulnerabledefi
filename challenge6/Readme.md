# Challenge #6 - Selfie

A new cool lending pool has launched! It's now offering flash loans of DVT tokens.

Wow, and it even includes a really fancy governance mechanism to control it.

What could go wrong, right ?

You start with no DVT tokens in balance, and the pool has 1.5 million. Your objective: take them all.

    [See the contracts](https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/selfie)
    [Complete the challenge](https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/selfie/selfie.challenge.js)

# Solution

The vulnerability in this challenge is exploited by doing the following:

1. Take a flashloan of the governance token.
2. Take a Snapshot with your governance token.
3. Submit a Action to the governance contract.

    - The action is uniquely crafted to call drainAllFunds() function in SelfiePool contract on behalf of the goverance contract.

    ```solidity
        actionId = simpleGovernance.queueAction(
             address(selfiePool),
             abi.encodeWithSignature("drainAllFunds(address)", owner),
             0
        );
    ```

    - This action would call the function `drainAllFunds` in the selfiePool, with parameter of who should get all the funds (in this case the attacker).

4. Repay the flashloan.
5. Allow two days to pass (to bypass timelock)
6. Execute the Action you submitted in step 3. (eg.`simpleGovernance.executeAction(actionId)`)
