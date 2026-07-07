import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeErrorResult,
  defineChain,
  formatEther,
  http
} from "viem";
import { tokenLaunchpadAbi } from "./contracts";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

export const explorerBaseUrl = process.env.NEXT_PUBLIC_EXPLORER_URL || "";

export const launchpadChain = defineChain({
  id: chainId,
  name: process.env.NEXT_PUBLIC_CHAIN_NAME || "Local Anvil",
  nativeCurrency: {
    name: process.env.NEXT_PUBLIC_NATIVE_CURRENCY_NAME || "Ether",
    symbol: process.env.NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL || "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [rpcUrl]
    }
  },
  blockExplorers: explorerBaseUrl
    ? {
        default: {
          name: "Explorer",
          url: explorerBaseUrl
        }
      }
    : undefined
});

// The public client is safe to create during module initialization because it only
// uses an HTTP transport and never asks the browser wallet to sign messages.
export const publicClient = createPublicClient({
  chain: launchpadChain,
  transport: http(rpcUrl)
});

export function hasInjectedWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function requestWalletAccount() {
  if (!hasInjectedWallet()) {
    throw new Error("No wallet was found. Install MetaMask or open this app in a wallet browser.");
  }

  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  return account;
}

export function getWalletClient(account) {
  if (!hasInjectedWallet()) {
    throw new Error("No wallet was found. Install MetaMask or open this app in a wallet browser.");
  }

  // The wallet client is created from the injected EIP-1193 provider. This is
  // the handoff point from browser wallet state to viem transaction signing.
  return createWalletClient({
    account,
    chain: launchpadChain,
    transport: custom(window.ethereum)
  });
}

export function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function explorerTxUrl(hash) {
  return explorerBaseUrl ? `${explorerBaseUrl.replace(/\/$/, "")}/tx/${hash}` : "";
}

export function explorerAddressUrl(address) {
  return explorerBaseUrl ? `${explorerBaseUrl.replace(/\/$/, "")}/address/${address}` : "";
}

export function parseViemError(error) {
  const data = error?.data?.data || error?.data || error?.cause?.data?.data || error?.cause?.data;

  if (data) {
    try {
      const decoded = decodeErrorResult({
        abi: tokenLaunchpadAbi,
        data
      });

      if (decoded.errorName === "InvalidCreationFee") {
        const [expected, received] = decoded.args;
        return `Invalid creation fee. Expected ${formatEther(expected)} ETH, received ${formatEther(received)} ETH.`;
      }

      const messages = {
        EmptyName: "Token name is required.",
        EmptySymbol: "Token symbol is required.",
        InvalidSupply: "Initial supply must be greater than zero.",
        FeeWithdrawalFailed: "The fee transfer failed."
      };

      return messages[decoded.errorName] || decoded.errorName;
    } catch {
      // Fall through to viem's shortMessage/message when revert data is not from the factory.
    }
  }

  return error?.shortMessage || error?.message || "Something went wrong. Please try again.";
}
