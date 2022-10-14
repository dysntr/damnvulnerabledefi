# Challenge #1 - Unstoppable

There's a lending pool with a million DVT tokens in balance, offering flash loans for free.

If only there was a way to attack and stop the pool from offering flash loans ...

You start with 100 DVT tokens in balance.

    [See the contracts] (https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/unstoppable)
    [Complete the challenge] (https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/unstoppable/unstoppable.challenge.js)

# Solution

The actual `DamnValuableToken.sol` is located in the root folder, `https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/`.

Solution can be found in `contracts/Exploit.sol` and `unstoppable.challenge.js`.

The vulnerability is in the following contract/function/line:

_Contract:_ `UnstoppableLender.sol`
_Function:_ `function flashLoan(uint256 borrowAmount) external nonReentrant`
_Line:_ `require(balanceAfter >= balanceBefore, "Flash loan hasn't been paid back");`

The require is checking for `>=` which means you can return more tokens than you borrow. This combined with the line `assert(poolBalance == balanceBefore);`, breaks the contract if you return more tokens that you initially borrowed. The `balanceBefore` is the token balance of the pool contract. If you return more tokens than borrowed, it makes the state variable `poolBalance` less than the actual balance of the pool contract.

To resolve this vulnerability, the require can be changed to `require(balanceAfter = balanceBefore, "Flash loan hasn't been paid back");`.

Note: The actual problem is having a dangerous assert in the code. You can break this assert by transferring any amount of token to the pool address.

Things I learned:

-   I learned that nonReentrant applies to the whole contract and just not functions in a contract.
