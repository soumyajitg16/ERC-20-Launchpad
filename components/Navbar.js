"use client";

import { useEffect, useRef, useState } from "react";
import { formatEther } from "viem";
import {
  hasInjectedWallet,
  launchpadChain,
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
  const dropdownRef = useRef(null);
  const readinessLabel = isConnecting ? "Connecting" : account ? "Ready to create" : "Not ready";
  const readinessDotClass = account
    ? "bg-emerald-500"
    : isConnecting
      ? "bg-amber-500"
      : "bg-zinc-400";

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

  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center">
          <img
            src="/tokenforge-logo.svg"
            alt="TokenForge Launchpad"
            className="h-10 w-auto"
          />
        </div>

        <div className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold uppercase text-zinc-600 md:flex">
          <span className={`h-2 w-2 rounded-full ${readinessDotClass}`} />
          {readinessLabel}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={account ? () => setIsDropdownOpen((value) => !value) : connectWallet}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
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
                  className="h-5 w-5"
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
            <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-800 bg-[#10182c] text-xs text-slate-200 shadow-lg shadow-slate-950/20">
              <div className="grid gap-3 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-md border border-indigo-400/20 bg-indigo-500/15 text-indigo-300">
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
                  <div className="grid h-8 w-8 place-items-center rounded-md border border-cyan-400/20 bg-cyan-500/15 text-cyan-300">
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
              </div>

              <button
                type="button"
                onClick={disconnectWallet}
                className="flex min-h-10 w-full items-center justify-center gap-2 border-t border-slate-800 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
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
