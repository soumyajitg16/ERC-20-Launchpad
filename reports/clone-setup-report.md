# Clone Setup Gas Report

## Executive Summary

The measured Foundry gas reports confirm that the EIP-1167 clone setup is materially better for this launchpad than the previous full-token deployment approach.

Using the successful token creation path from your gas reports:

| Metric | Previous full deployment | Current clone setup | Difference |
| --- | ---: | ---: | ---: |
| Successful `launchToken` gas | 752,071 | 370,472 | 381,599 gas saved |
| Per-token reduction | - | - | 50.74% lower |
| Factory deployment gas | 1,683,935 | 1,627,142 | 56,793 gas saved |
| Factory deployment size | 7,637 bytes | 7,416 bytes | 221 bytes smaller |

The biggest win is token creation. Every successful token launch costs about half as much with the clone setup.

## How To Read The Gas Report

The `launchToken` row includes multiple call types:

- Cheap validation or revert paths.
- Successful token creation paths.
- Multiple test calls with different state conditions.

For comparing the old architecture against the clone architecture, the most relevant number is the expensive successful creation path. In both reports, that appears as the `Max` value for `launchToken`.

That gives the clearest apples-to-apples comparison:

```text
Previous full token deployment: 752,071 gas
Current clone token creation:   370,472 gas
Gas saved per successful token: 381,599 gas
Reduction:                     50.74%
```

The `Min` values around `28k` gas are not representative of successful token creation. They are likely cheap revert or validation calls.

## Actual Measured Results

### Current Clone Setup

`src/TokenLaunchpad.sol:TokenLaunchpad`

| Metric | Value |
| --- | ---: |
| Deployment cost | 1,627,142 gas |
| Deployment size | 7,416 bytes |

| Function | Min | Avg | Median | Max | Calls |
| --- | ---: | ---: | ---: | ---: | ---: |
| `CREATION_FEE` | 261 | 261 | 261 | 261 | 4 |
| `getToken` | 17,701 | 17,701 | 17,701 | 17,701 | 1 |
| `getTokenCount` | 2,313 | 2,313 | 2,313 | 2,313 | 2 |
| `launchToken` | 28,326 | 280,657 | 361,916 | 370,472 | 4 |
| `tokenImplementation` | 260 | 260 | 260 | 260 | 4 |

`src/LaunchedToken.sol:LaunchedToken`

| Metric | Value |
| --- | ---: |
| Deployment cost | 0 gas in direct report |
| Deployment size | 2,971 bytes |

| Function | Min | Avg | Median | Max | Calls |
| --- | ---: | ---: | ---: | ---: | ---: |
| `balanceOf` | 2,534 | 2,534 | 2,534 | 2,534 | 1 |
| `initialize` | 139,969 | 139,969 | 139,969 | 139,969 | 3 |
| `name` | 3,173 | 3,173 | 3,173 | 3,173 | 1 |
| `owner` | 2,322 | 2,322 | 2,322 | 2,322 | 1 |
| `symbol` | 3,217 | 3,217 | 3,217 | 3,217 | 1 |
| `totalSupply` | 2,325 | 2,325 | 2,325 | 2,325 | 3 |

Note: `LaunchedToken` shows `0` direct deployment cost because the implementation is deployed from inside the launchpad constructor in this benchmark. The implementation cost is effectively included in the `TokenLaunchpad` deployment cost.

### Previous Full Deployment Setup

`src/TestLaunchpad.sol:TestLaunchpad`

| Metric | Value |
| --- | ---: |
| Deployment cost | 1,683,935 gas |
| Deployment size | 7,637 bytes |

| Function | Min | Avg | Median | Max | Calls |
| --- | ---: | ---: | ---: | ---: | ---: |
| `CREATION_FEE` | 239 | 239 | 239 | 239 | 2 |
| `getToken` | 17,701 | 17,701 | 17,701 | 17,701 | 1 |
| `getTokenCount` | 2,313 | 2,313 | 2,313 | 2,313 | 1 |
| `launchToken` | 28,304 | 390,187 | 390,187 | 752,071 | 2 |

`src/TestToken.sol:TestToken`

| Metric | Value |
| --- | ---: |
| Deployment cost | 0 gas in direct report |
| Deployment size | 3,672 bytes |

| Function | Min | Avg | Median | Max | Calls |
| --- | ---: | ---: | ---: | ---: | ---: |
| `balanceOf` | 2,648 | 2,648 | 2,648 | 2,648 | 1 |

## Direct Savings

### Per Successful Token Creation

```text
Old launch gas:   752,071
Clone launch gas: 370,472
Gas saved:        381,599
```

Percentage reduction:

```text
381,599 / 752,071 = 50.74%
```

So the clone setup reduces successful token creation gas by about `50.74%`.

### Deployment Cost

Your measured deployment result is also favorable to the clone setup:

```text
Old launchpad deployment:   1,683,935 gas
Clone launchpad deployment: 1,627,142 gas
Gas saved:                    56,793 gas
```

Percentage reduction:

```text
56,793 / 1,683,935 = 3.37%
```

This is even better than the usual theoretical expectation. Often clone factories have a higher upfront cost because they deploy the implementation once. In this specific measured project, the clone-based deployment is still slightly cheaper overall.

## Cumulative Gas Impact

Using the measured successful creation path:

```text
Old total gas   = old factory deployment + (752,071 * number of launches)
Clone total gas = clone factory deployment + (370,472 * number of launches)
```

| Successful launches | Previous total gas | Clone total gas | Gas saved | Reduction |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 2,436,006 | 1,997,614 | 438,392 | 18.00% |
| 10 | 9,204,645 | 5,331,862 | 3,872,783 | 42.07% |
| 100 | 76,891,035 | 38,674,342 | 38,216,693 | 49.70% |
| 1,000 | 753,754,935 | 372,099,142 | 381,655,793 | 50.63% |

The savings grow linearly with every token created.

## ETH Cost Savings Example

Assume:

- Gas saved per successful launch: `381,599 gas`
- Gas price: `20 gwei`
- ETH price: `$3,000`

Per token:

```text
381,599 gas * 20 gwei = 0.00763198 ETH
0.00763198 ETH * $3,000 = $22.90 saved per token
```

At 100 token launches:

```text
0.00763198 ETH * 100 = 0.763198 ETH saved
0.763198 ETH * $3,000 = $2,289.59 saved
```

At 1,000 token launches:

```text
0.00763198 ETH * 1,000 = 7.63198 ETH saved
7.63198 ETH * $3,000 = $22,895.94 saved
```

These dollar values change with gas price and ETH price, but the gas-unit savings are measured directly from the benchmark.

## Why The Clone Setup Wins

### 1. It Avoids Re-Deploying Full Token Bytecode

The old architecture deployed a new full token contract for every token:

```text
new TestToken(...)
```

The current architecture deploys one implementation and then creates minimal proxies:

```text
Clones.clone(tokenImplementation)
LaunchedToken(clone).initialize(...)
```

This avoids paying full bytecode deployment cost for every launch.

### 2. The Clone Runtime Is Tiny

An EIP-1167 proxy is much smaller than a full token contract. Your measured deployment sizes show the same direction:

```text
Previous token size: 3,672 bytes
Clone implementation size: 2,971 bytes
```

The actual per-token clone proxy is much smaller than either full implementation. The clone forwards calls to the shared implementation and stores its own token state.

### 3. Repeated Launches Compound The Savings

For one launch, the clone setup already saves `438,392` total gas including deployment.

For 100 launches, it saves `38,216,693` gas.

For 1,000 launches, it saves `381,655,793` gas.

This is exactly the workload where EIP-1167 clones are useful: many similar contracts with separate state and shared logic.

## Architecture Comparison

### Previous Approach

```text
TokenLaunchpad
  -> deploy full ERC20 token
  -> repeat full bytecode deployment for every user
```

Benefits:

- Simple mental model.
- Each token has standalone code.

Downsides:

- Expensive per token.
- Repeats deployment of the same logic.
- Larger total on-chain bytecode footprint.

### Current Clone Approach

```text
TokenLaunchpad
  -> deploy one implementation once
  -> deploy cheap clone per user
  -> initialize clone state
```

Benefits:

- About `50.74%` lower gas per successful token launch in your benchmark.
- Smaller cumulative on-chain footprint.
- Cleaner repeated-token-creation architecture.
- Consistent logic across all created tokens.

Downsides:

- Requires initializer safety.
- All clones depend on the same implementation logic.
- Not upgradeable unless explicit versioning or upgrade architecture is added.

## Important Security Notes

The clone setup is safe only if initialization is handled correctly.

This project handles that by:

- Using OpenZeppelin `Initializable`.
- Calling `initialize(...)` immediately after cloning.
- Disabling initialization on the implementation contract with `_disableInitializers()`.
- Assigning each clone its own name, symbol, owner, total supply, balances, and allowances.

This prevents someone from taking over the implementation contract and prevents clone re-initialization.

## Recommendation

Keep the EIP-1167 clone setup.

The measured data shows:

- Token creation is `381,599` gas cheaper per successful launch.
- Successful token creation gas is reduced by `50.74%`.
- Total gas savings become very large as more users create tokens.
- The architecture better matches a launchpad where many similar tokens are created over time.

The previous full-deployment model is acceptable for one-off token deployments, but it is not the best fit for a repeated token launchpad.
