"use client";

import { useEffect, useRef, useState } from "react";
import { formatEther } from "viem";
import { factoryAddress, tokenLaunchpadAbi } from "../utils/contracts";
import {
  explorerTxUrl,
  getWalletClient,
  hasInjectedWallet,
  launchpadChain,
  parseViemError,
  publicClient,
  requestWalletAccount,
  shortenAddress
} from "../utils/viemClient";

export default function Navbar({ account, setAccount }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [walletDetails, setWalletDetails] = useState({
    balance: "",
    chainId: launchpadChain.id,
    network: launchpadChain.name
  });
  const [ownerAddress, setOwnerAddress] = useState("");
  const [feeBalanceWei, setFeeBalanceWei] = useState(0n);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemStatus, setRedeemStatus] = useState({ type: "idle", message: "" });
  const [redeemTxHash, setRedeemTxHash] = useState("");
  const dropdownRef = useRef(null);
  const readinessLabel = isConnecting ? "Connecting" : account ? "Ready to create" : "Not ready";
  const readinessDotClass = account
    ? "bg-emerald-500"
    : isConnecting
      ? "bg-amber-500"
      : "bg-zinc-400";
  const isLaunchpadOwner =
    Boolean(account && ownerAddress) && account.toLowerCase() === ownerAddress.toLowerCase();
  const hasRedeemableFees = feeBalanceWei > 0n;

  useEffect(() => {
    if (!hasInjectedWallet()) return undefined;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then(([connectedAccount]) => {
        if (connectedAccount) setAccount(connectedAccount);
      })
      .catch(() => {});

    function handleAccountsChanged(accounts) {
      setAccount(accounts[0] || "");
      if (!accounts[0]) setIsDropdownOpen(false);
    }

    function handleChainChanged(chainId) {
      setWalletDetails((current) => ({
        ...current,
        chainId: Number(chainId),
        network: getNetworkName(Number(chainId))
      }));
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [setAccount]);

  useEffect(() => {
    if (!account || !hasInjectedWallet()) return;

    let isMounted = true;

    async function loadWalletDetails() {
      try {
        const [chainIdHex, balanceHex] = await Promise.all([
          window.ethereum.request({ method: "eth_chainId" }),
          window.ethereum.request({
            method: "eth_getBalance",
            params: [account, "latest"]
          })
        ]);

        if (!isMounted) return;

        const chainId = Number(chainIdHex);
        setWalletDetails({
          balance: formatWalletBalance(balanceHex),
          chainId,
          network: getNetworkName(chainId)
        });
      } catch {
        if (isMounted) {
          setWalletDetails({
            balance: "",
            chainId: launchpadChain.id,
            network: launchpadChain.name
          });
        }
      }
    }

    loadWalletDetails();

    return () => {
      isMounted = false;
    };
  }, [account]);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminDetails() {
      if (!account || !factoryAddress) {
        if (isMounted) {
          setOwnerAddress("");
          setFeeBalanceWei(0n);
          setRedeemStatus({ type: "idle", message: "" });
          setRedeemTxHash("");
        }
        return;
      }

      try {
        const [owner, feeBalance] = await Promise.all([
          publicClient.readContract({
            address: factoryAddress,
            abi: tokenLaunchpadAbi,
            functionName: "owner"
          }),
          publicClient.getBalance({ address: factoryAddress })
        ]);

        if (!isMounted) return;

        setOwnerAddress(owner);
        setFeeBalanceWei(feeBalance);
        setRedeemStatus({ type: "idle", message: "" });
        setRedeemTxHash("");
      } catch {
        if (isMounted) {
          setOwnerAddress("");
          setFeeBalanceWei(0n);
        }
      }
    }

    loadAdminDetails();

    return () => {
      isMounted = false;
    };
  }, [account]);

  useEffect(() => {
    function closeDropdown(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", closeDropdown);

    return () => {
      document.removeEventListener("mousedown", closeDropdown);
    };
  }, []);

  async function connectWallet() {
    setIsConnecting(true);
    try {
      const connectedAccount = await requestWalletAccount();
      setAccount(connectedAccount);
    } finally {
      setIsConnecting(false);
    }
  }

  async function disconnectWallet() {
    if (hasInjectedWallet()) {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }]
        });
      } catch {
        // Some injected wallets do not support revoking permissions from dApps.
      }
    }

    setAccount("");
    setIsDropdownOpen(false);
    setWalletDetails({
      balance: "",
      chainId: launchpadChain.id,
      network: launchpadChain.name
    });
    setOwnerAddress("");
    setFeeBalanceWei(0n);
    setRedeemStatus({ type: "idle", message: "" });
    setRedeemTxHash("");
  }

  async function refreshAdminBalance() {
    if (!factoryAddress) return;

    try {
      const feeBalance = await publicClient.getBalance({ address: factoryAddress });
      setFeeBalanceWei(feeBalance);
    } catch {
      setFeeBalanceWei(0n);
    }
  }

  async function redeemCreationFees() {
    if (!factoryAddress) {
      setRedeemStatus({
        type: "error",
        message: "The token creator is not connected yet. Deploy the contract and add its address to .env.local."
      });
      return;
    }

    if (!account) return;

    setIsRedeeming(true);
    setRedeemTxHash("");
    setRedeemStatus({ type: "pending", message: "Opening your wallet to redeem fees..." });

    try {
      const walletClient = getWalletClient(account);

      const { request } = await publicClient.simulateContract({
        account,
        address: factoryAddress,
        abi: tokenLaunchpadAbi,
        functionName: "withdrawFees",
        args: [account]
      });

      setRedeemStatus({ type: "pending", message: "Sending the fee redemption transaction..." });
      const hash = await walletClient.writeContract(request);
      setRedeemTxHash(hash);
      setRedeemStatus({ type: "pending", message: "Waiting for redemption confirmation..." });

      await publicClient.waitForTransactionReceipt({ hash });
      await refreshAdminBalance();

      setRedeemStatus({ type: "success", message: "Creation fees redeemed to your wallet." });
    } catch (error) {
      setRedeemStatus({ type: "error", message: parseViemError(error) });
    } finally {
      setIsRedeeming(false);
    }
  }

  function getNetworkName(chainId) {
    if (chainId === launchpadChain.id) return launchpadChain.name;
    return `Chain ${chainId}`;
  }

  function formatWalletBalance(balanceHex) {
    const balance = Number(formatEther(BigInt(balanceHex)));
    return balance.toLocaleString(undefined, {
      maximumFractionDigits: 4
    });
  }

  function formatFeeBalance(balanceWei) {
    const balance = Number(formatEther(balanceWei));
    return balance.toLocaleString(undefined, {
      maximumFractionDigits: 4
    });
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex items-center">
          <img
            src="/tokenforge-logo.svg"
            alt="TokenForge Launchpad"
            className="h-8 w-auto"
          />
        </div>

        <div className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-[11px] font-semibold uppercase text-zinc-600 md:flex">
          <span className={`h-2 w-2 rounded-full ${readinessDotClass}`} />
          {readinessLabel}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={account ? () => setIsDropdownOpen((value) => !value) : connectWallet}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
              account
                ? "border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50"
                : "border border-indigo-500 bg-indigo-600 text-white shadow-glow hover:bg-indigo-500"
            }`}
            disabled={isConnecting}
          >
            {account ? (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-mono uppercase">{shortenAddress(account)}</span>
              </>
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14" />
                  <path d="M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5" />
                  <path d="M16 14h.01" />
                </svg>
                {isConnecting ? "Connecting..." : "Connect"}
              </>
            )}
          </button>

          {account && isDropdownOpen ? (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-800 bg-[#10182c] text-xs text-slate-200 shadow-lg shadow-slate-950/20">
              <div className="grid gap-2.5 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-md border border-indigo-400/20 bg-indigo-500/15 text-indigo-300">
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 12h4l3 7 4-14 3 7h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Network</p>
                    <p className="font-bold text-slate-100">{walletDetails.network}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-md border border-cyan-400/20 bg-cyan-500/15 text-cyan-300">
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="8" cy="8" r="5" />
                      <path d="M8 5v3l2 2" />
                      <path d="M14 14.5A6 6 0 1 0 20.5 8" />
                      <path d="M18 8h2.5V5.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Balance</p>
                    <p className="font-bold text-slate-100">
                      {walletDetails.balance || "--"} {launchpadChain.nativeCurrency.symbol}
                    </p>
                  </div>
                </div>

                {isLaunchpadOwner ? (
                  <div className="rounded-md border border-emerald-400/20 bg-emerald-500/10 p-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300/70">
                          Admin fees
                        </p>
                        <p className="mt-0.5 font-bold text-emerald-50">
                          {formatFeeBalance(feeBalanceWei)} {launchpadChain.nativeCurrency.symbol}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={redeemCreationFees}
                        disabled={isRedeeming || !hasRedeemableFees}
                        className="min-h-8 rounded-md bg-emerald-400 px-3 text-[11px] font-bold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isRedeeming ? "Redeeming" : "Redeem"}
                      </button>
                    </div>

                    {redeemStatus.message ? (
                      <div
                        className={`mt-2 rounded-md border px-2.5 py-2 ${
                          redeemStatus.type === "error"
                            ? "border-red-400/30 bg-red-500/10 text-red-200"
                            : redeemStatus.type === "success"
                              ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                              : "border-blue-300/30 bg-blue-400/10 text-blue-100"
                        }`}
                      >
                        <p>{redeemStatus.message}</p>
                        {redeemTxHash ? (
                          <a
                            className="mt-1 inline-flex break-all font-bold text-emerald-200 underline-offset-4 hover:underline"
                            href={explorerTxUrl(redeemTxHash) || "#"}
                            target={explorerTxUrl(redeemTxHash) ? "_blank" : undefined}
                            rel="noreferrer"
                          >
                            {explorerTxUrl(redeemTxHash) ? "View redemption" : redeemTxHash}
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={disconnectWallet}
                className="flex min-h-9 w-full items-center justify-center gap-2 border-t border-slate-800 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
                </svg>
                Disconnect
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
