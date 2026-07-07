# ERC20 Launchpad Contracts

Foundry workspace for the ERC20 Token Launchpad contracts.

## Architecture

`TokenLaunchpad` deploys one `LaunchedToken` implementation in its constructor. Every token launch creates an EIP-1167 minimal proxy clone of that implementation with OpenZeppelin `Clones`, then calls `initialize` on the clone to set:

- token name
- token symbol
- initial supply
- token owner

This keeps repeated token creation cheaper than deploying full ERC20 bytecode for every user.

## Commands

Install dependencies from this folder:

```bash
forge install --no-git foundry-rs/forge-std
forge install --no-git OpenZeppelin/openzeppelin-contracts
```

Build and test:

```bash
forge build
forge test
```

Deploy:

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast
```
