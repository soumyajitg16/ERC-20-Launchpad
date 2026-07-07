# ERC20 Token Launchpad

A modern ERC20 launchpad dApp with a Foundry smart-contract backend and a Next.js App Router frontend. Users connect an injected wallet, pay a fixed `0.01 ETH` creation fee, create an ERC20 token clone, and browse every token launched through the factory.

## Technical Overview

- `TokenLaunchpad.sol` is a payable EIP-1167 factory. It deploys one `LaunchedToken` implementation, creates minimal proxy clones for each launch, stores token metadata, tracks all launches, and lets the factory owner withdraw creation fees.
- `LaunchedToken.sol` is an initializer-based ERC20 implementation. Each clone receives its own name, symbol, initial supply, and owner during clone setup.
- The frontend uses Next.js App Router with JavaScript and Tailwind CSS.
- All on-chain reads and writes are handled with raw `viem` clients. The app does not use `ethers.js`, wagmi hooks, or wagmi UI components.
- `utils/viemClient.js` creates a reusable HTTP `publicClient`, creates browser wallet clients from `window.ethereum`, and decodes factory custom errors from revert data.

## Prerequisites

- Node.js v18 or newer
- npm
- Foundry toolchain: `forge`, `cast`, and `anvil`
- MetaMask or another injected EIP-1193 browser wallet

Install Foundry from the official installer if needed:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Environment Variables

Copy the frontend template and fill in deployment values:

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_FACTORY_ADDRESS=0xYourDeployedFactory
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_CHAIN_NAME=Local Anvil
NEXT_PUBLIC_EXPLORER_URL=
```

`NEXT_PUBLIC_EXPLORER_URL` is optional. When set, transaction hashes and token addresses link to that explorer.

Copy the Foundry deploy template when broadcasting scripts:

```bash
cp contracts/.env.example contracts/.env
```

```bash
PRIVATE_KEY=0xYourLocalAnvilPrivateKey
```

## Install Dependencies

Install frontend packages:

```bash
npm install
```

Install Foundry libraries:

```bash
cd contracts
forge install --no-git foundry-rs/forge-std
forge install --no-git OpenZeppelin/openzeppelin-contracts
```

## Compile and Test Contracts

```bash
cd contracts
forge build
forge test
```

## Local Deployment Flow

Start a local chain:

```bash
anvil
```

In another terminal, deploy the factory using one of Anvil's funded private keys:

```bash
cd contracts
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast
```

Copy the deployed `TokenLaunchpad` address into `.env.local` as `NEXT_PUBLIC_FACTORY_ADDRESS`.

## Run the Frontend

```bash
npm run dev
```

Open `http://localhost:3000`, connect MetaMask to the same chain, and import an Anvil account if you are testing locally.

## Project Structure

```text
contracts/
  src/
    LaunchedToken.sol
    TokenLaunchpad.sol
  script/
    Deploy.s.sol
  test/
    TokenLaunchpad.t.sol
  foundry.toml
app/
  layout.js
  page.js
  globals.css
components/
  LaunchForm.js
  Navbar.js
  TokenGrid.js
utils/
  contracts.js
  viemClient.js
```

## Notes for Production

- Replace the local RPC and chain settings with your target network values.
- Fund the deployer wallet before broadcasting to a public network.
- Verify the factory contract on your target block explorer after deployment.
- Keep `PRIVATE_KEY` out of source control. The `.gitignore` excludes `.env` and `.env.local`.
- Consider adding fee governance, token creation limits, and indexed off-chain analytics for high-traffic deployments.
