# Challenge #10 - Free rider

A new marketplace of Damn Valuable NFTs has been released! There's been an initial mint of 6 NFTs, which are available for sale in the marketplace. Each one at 15 ETH.

A buyer has shared with you a secret alpha: the marketplace is vulnerable and all tokens can be taken. Yet the buyer doesn't know how to do it. So it's offering a payout of 45 ETH for whoever is willing to take the NFTs out and send them their way.

You want to build some rep with this buyer, so you've agreed with the plan.

Sadly you only have 0.5 ETH in balance. If only there was a place where you could get free ETH, at least for an instant.

    [See the contracts](https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/free-rider)
    [Complete the challenge](https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/free-rider/free-rider.challenge.js)

# Solution

The vulnerability in this challenge is in the `FreeRiderNFTMarketplace.sol`. Specifically in the `_buyOne()`:

```solidity
        token.safeTransferFrom(token.ownerOf(tokenId), msg.sender, tokenId);

        // pay seller
        payable(token.ownerOf(tokenId)).sendValue(priceToPay);
```

In this function, the function first transfers the NFT to the buyer, and then sends the token to the token owner (which is also the buyer). These two statements needs to be reversed to resolve the vulnerability.
