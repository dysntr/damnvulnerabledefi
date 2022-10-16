# Challenge #4 - Side entrance

A surprisingly simple lending pool allows anyone to deposit ETH, and withdraw it at any point in time.

This very simple lending pool has 1000 ETH in balance already, and is offering free flash loans using the deposited ETH to promote their system.

You must take all ETH from the lending pool.

    [See the contracts](https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/side-entrance)
    [Complete the challenge](https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/side-entrance/side-entrance.challenge.js)

# Solution

The vulnerability lies in the fact that the functions don't have reentrancy guards. An attack can takeout a flashloan and deposit it back into the contract. This makes the `flashloan()` believe you have payed back the loan, and also believes the attacker is owned the deposit. The deposit can be withdrawn afterwards.
