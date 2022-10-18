# Challenge #7 - Compromised

While poking around a web service of one of the most popular DeFi projects in the space, you get a somewhat strange response from their server. This is a snippet:

```js
          HTTP/2 200 OK
          content-type: text/html
          content-language: en
          vary: Accept-Encoding
          server: cloudflare

          4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35

          4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34

```

A related on-chain exchange is selling (absurdly overpriced) collectibles called "DVNFT", now at 999 ETH each

This price is fetched from an on-chain oracle, and is based on three trusted reporters: 0xA73209FB1a42495120166736362A1DfA9F95A105,0xe92401A4d3af5E446d93D11EEc806b1462b39D15 and 0x81A5D6E50C214044bE44cA0CB057fe119097850c.

Starting with only 0.1 ETH in balance, you must steal all ETH available in the exchange.

    [See the contracts](https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/compromised)
    [Complete the challenge](https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/compromised/compromised.challenge.js)

# Solution

The strange response from the server is the private key for two of the oracles. You need to decode the response from base64(hex->ascii). You can import the wallet using the private keys of the oracles. You can set the prices for the token, with the oracle's private key.

Here is how you set a private key for a signer:

```js
const signer = new ethers.Wallet(your_private_key_string, provider)
```

```js
const account = utils.HDNode.fromMnemonic(your_mnemonic_string).derivePath(
    `m/44'/60'/0'/0/${your_selected_account}`
)

const signer = new Wallet(account, provider)
```

You only need to change the prices for two oracles, as it takes the median price for selling/buying nfts.

You need to do the following to exploit the exchange:

1. Import the 2 compromised oracles
2. Change the NFT price to `0.01` ether on the two compromised oracles by calling `postPrice()`
3. Buy 1 NFT
4. Approve Exchange to sell the NFT
5. Change the NFT price to `exchange.balance()` on the two compromised oracles by calling `postPrice()`
6. Sell 1 NFT
7. Change the NFT price back to original price on the two compromised oracles by calling `postPrice()`

Code can be found in `compromised.challenge.js`.
