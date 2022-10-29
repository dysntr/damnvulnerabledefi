# Challenge #11 - Backdoor

To incentivize the creation of more secure wallets in their team, someone has deployed a registry of Gnosis Safe wallets. When someone in the team deploys and registers a wallet, they will earn 10 DVT tokens.

To make sure everything is safe and sound, the registry tightly integrates with the legitimate Gnosis Safe Proxy Factory, and has some additional safety checks.

Currently there are four people registered as beneficiaries: Alice, Bob, Charlie and David. The registry has 40 DVT tokens in balance to be distributed among them.

Your goal is to take all funds from the registry. In a single transaction.

    [See the contracts](https://github.com/tinchoabbate/damn-vulnerable-defi/tree/v2.2.0/contracts/backdoor)
    [Complete the challenge](https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v2.2.0/test/backdoor/backdoor.challenge.js)

# Solution

Gnosis Safe Proxy allows installations of modules during the setup. In this challenge the gnosis safe proxy was not setup/claimed by the users. This allows an attacker to setup a backdoor through installing a malicious module. The `exploit.sol` contract calls the setup for the gnosis safe proxy for each of the users. It requests gnosis safe to install the malicious module (backdooring the gnosis safe for each user). It then uses the backdoor to take ownership of the gnosis safe (not needed to solve this challenge), and steal the tokens (solving the challenge).

The contract `ControllerModule.sol` is the malicious module.

# Credits

-   silent_mastodon#1304 - for his mad skillz, ideas and insight.
-   https://gist.github.com/tinchoabbate/4b8be18615c4f4a4049280c014327652
-   https://ventral.digital/posts/2022/6/28/damn-vulnerable-defi-v2-11-backdoor
-   https://zuhaibmd.medium.com/damn-vulnerable-defi-challenge-11-backdoor-33cac87c37b8
