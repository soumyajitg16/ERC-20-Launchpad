# TokenForge ERC20 Launchpad

A modern ERC20 launchpad dApp with a Foundry smart-contract backend and a Next.js App Router frontend. Users connect an injected wallet, pay a fixed `0.01` native-token creation fee, create an ERC20 token clone, and browse every token launched through the factory.

The current frontend brand is **TokenForge Launchpad**. It includes a custom SVG favicon, navbar logo, compact wallet dropdown, token address copy action, token verification link action, and App Router SEO metadata for Vercel deployments.

## Technical Overview

- `TokenLaunchpad.sol` is a payable EIP-1167 factory. It deploys one `LaunchedToken` implementation, creates minimal proxy clones for each launch, stores token metadata, tracks all launches, and lets the factory owner withdraw creation fees.
- `LaunchedToken.sol` is an initializer-based ERC20 implementation. Each clone receives its own name, symbol, initial supply, and owner during clone setup.
- The frontend uses Next.js App Router with JavaScript and Tailwind CSS.
- All on-chain reads and writes are handled with raw `viem` clients. The app does not use `ethers.js`, wagmi hooks, or wagmi UI components.
- `utils/viemClient.js` creates a reusable HTTP `publicClient`, creates browser wallet clients from `window.ethereum`, and decodes factory custom errors from revert data.
- `components/Navbar.js` manages injected-wallet connection state, shows the connected account as a compact pill, and exposes a dropdown with active network, native balance, and disconnect.
- `components/TokenGrid.js` shows the two newest tokens by default, provides a `View all` toggle, and includes copy plus verification actions for each token address.
- `utils/seo.js` centralizes site metadata, canonical URL handling, and absolute URLs for sitemap, robots, Open Graph, Twitter, and JSON-LD output.
- `public/favicon.svg` and `public/tokenforge-logo.svg` provide the app favicon and navbar logo.

## Frontend Features

- Light dashboard layout with darker heading and paragraph contrast.
- Token creator form with a fixed launch fee display.
- Compact wallet connect button with wallet icon.
- Connected wallet dropdown showing network, balance, and disconnect.
- Token list that defaults to two visible items and expands with `View all`.
- Token address row with copy and verify-link icons.
- Custom TokenForge favicon and navbar logo.
- SEO-ready App Router metadata, generated social preview images, manifest, robots file, sitemap, canonical URL, and JSON-LD structured data.
- Next.js dev indicator portal is hidden so development issue badges do not cover the app UI.

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
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_FACTORY_ADDRESS=0xYourDeployedTokenLaunchpad
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_CHAIN_NAME=Polygon Amoy
NEXT_PUBLIC_NATIVE_CURRENCY_NAME=POL
NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL=POL
NEXT_PUBLIC_EXPLORER_URL=https://amoy.polygonscan.com
```

`NEXT_PUBLIC_SITE_URL` should be the final Vercel or custom production domain so canonical URLs, sitemap entries, and social previews point to the correct site. `NEXT_PUBLIC_EXPLORER_URL` is optional. When set, transaction hashes, token addresses, and token verification icons link to that explorer.

Copy the Foundry deploy template when broadcasting scripts:

```bash
cp contracts/.env.example contracts/.env
```

```bash
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=0xYourDeployerPrivateKey
```

Never commit `.env`, `.env.local`, or a real private key.

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

## Polygon Amoy and Vercel Deployment

For the full online deployment flow, see [`DEPLOYMENT.md`](DEPLOYMENT.md). The short version is:

```bash
cd contracts
forge script script/Deploy.s.sol:Deploy --rpc-url amoy --broadcast -vvvv
```

Copy the deployed `TokenLaunchpad` address from Foundry's `broadcast/Deploy.s.sol/80002/run-latest.json`, set it as `NEXT_PUBLIC_FACTORY_ADDRESS` in Vercel, and deploy the root Next.js app with the default Vercel Next.js settings.

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
  manifest.js
  opengraph-image.js
  layout.js
  page.js
  robots.js
  sitemap.js
  twitter-image.js
  globals.css
components/
  LaunchForm.js
  Navbar.js
  TokenGrid.js
public/
  favicon.svg
  tokenforge-logo.svg
utils/
  contracts.js
  seo.js
  viemClient.js
DEPLOYMENT.md
next.config.js
```

## Notes for Production

- Use Polygon Amoy values for the testnet deployment, or replace the RPC, chain, explorer, and native currency settings if you move to another network.
- Fund the deployer wallet before broadcasting to a public network.
- Verify the factory and launched token contracts on your target block explorer after deployment.
- Set `NEXT_PUBLIC_EXPLORER_URL` for production so address links and verification icons point users to the correct explorer.
- Set `NEXT_PUBLIC_SITE_URL` in Vercel so SEO metadata, canonical URLs, sitemap URLs, and social image URLs use the production domain.
- Keep `PRIVATE_KEY` out of source control. The `.gitignore` excludes `.env` and `.env.local`.
- Consider adding fee governance, token creation limits, and indexed off-chain analytics for high-traffic deployments.
