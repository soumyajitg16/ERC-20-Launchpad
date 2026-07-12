# Deploy TokenForge Online

This project has two deployable pieces:

- Foundry contracts in `contracts/`, deployed to Polygon Amoy.
- Next.js frontend at the repo root, deployed to Vercel.

## 1. Prepare A Deployer Wallet

Use a dedicated testnet wallet. Do not use a wallet that holds real funds.

Fund it with Amoy POL from a Polygon faucet, then copy the private key only into your local `contracts/.env` file.

```powershell
Copy-Item contracts\.env.example contracts\.env
```

Edit `contracts/.env`:

```dotenv
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=0xYourDeployerPrivateKey
```

You can replace `AMOY_RPC_URL` with an Alchemy, Infura, QuickNode, or other Amoy RPC URL if you prefer. Keep in mind that any RPC URL used by the browser frontend will be public.

## 2. Build And Test Contracts

From the contracts folder:

```powershell
cd contracts
forge build
forge test
```

## 3. Deploy Contracts To Amoy

From `contracts/`:

```powershell
forge script script/Deploy.s.sol:Deploy --rpc-url amoy --broadcast -vvvv
```

The script prints the deployer address, and Foundry writes the deployed contract address into the broadcast output under:

```text
contracts/broadcast/Deploy.s.sol/80002/run-latest.json
```

Copy the deployed `TokenLaunchpad` address. You will use it as `NEXT_PUBLIC_FACTORY_ADDRESS`.

## 4. Configure The Frontend Locally

Return to the project root:

```powershell
cd ..
Copy-Item .env.example .env.local
```

Edit `.env.local`:

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_FACTORY_ADDRESS=0xYourDeployedTokenLaunchpad
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_CHAIN_NAME=Polygon Amoy
NEXT_PUBLIC_NATIVE_CURRENCY_NAME=POL
NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL=POL
NEXT_PUBLIC_EXPLORER_URL=https://amoy.polygonscan.com
```

Then test the app:

```powershell
npm install
npm run build
npm run dev
```

Open `http://localhost:3000`, connect MetaMask, and make sure MetaMask is on Polygon Amoy. The app reads from the RPC URL and sends token creation transactions through the connected wallet.

## 5. Deploy The Frontend To Vercel

The easiest production flow is GitHub plus Vercel:

1. Push this repo to GitHub.
2. In Vercel, choose **Add New Project** and import the repository.
3. Keep the framework preset as **Next.js**.
4. Add these environment variables for **Production**, and usually **Preview** too:

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_FACTORY_ADDRESS=0xYourDeployedTokenLaunchpad
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_CHAIN_NAME=Polygon Amoy
NEXT_PUBLIC_NATIVE_CURRENCY_NAME=POL
NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL=POL
NEXT_PUBLIC_EXPLORER_URL=https://amoy.polygonscan.com
```

5. Deploy.

Vercel should use these defaults automatically:

```text
Build Command: npm run build
Install Command: npm install
Output Directory: .next
Root Directory: .
```

## 6. Optional CLI Deployment

If you prefer the Vercel CLI:

```powershell
npm i -g vercel
vercel
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_FACTORY_ADDRESS production
vercel env add NEXT_PUBLIC_RPC_URL production
vercel env add NEXT_PUBLIC_CHAIN_ID production
vercel env add NEXT_PUBLIC_CHAIN_NAME production
vercel env add NEXT_PUBLIC_NATIVE_CURRENCY_NAME production
vercel env add NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL production
vercel env add NEXT_PUBLIC_EXPLORER_URL production
vercel --prod
```

Use the same values from the previous section when Vercel prompts for each variable.

## 7. Production Checklist

- The deployed factory address in Vercel matches the Amoy deployment.
- `NEXT_PUBLIC_SITE_URL` matches the final production domain so canonical, sitemap, and social URLs are correct.
- MetaMask is connected to Amoy, chain ID `80002`.
- The deployer wallet has enough POL to deploy the factory.
- User wallets have enough POL to pay gas and the launch fee.
- `PRIVATE_KEY` is never added to Vercel, GitHub, or any frontend `.env` file.
- RPC provider keys used in `NEXT_PUBLIC_RPC_URL` are considered public browser credentials.
- Token/address links open on `https://amoy.polygonscan.com`.
