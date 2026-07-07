"use client";

import { useEffect, useState } from "react";
import { hasInjectedWallet, requestWalletAccount, shortenAddress } from "../utils/viemClient";

export default function Navbar({ account, setAccount }) {
  const [isConnecting, setIsConnecting] = useState(false);

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
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [setAccount]);

  async function connectWallet() {
    setIsConnecting(true);
    try {
      const connectedAccount = await requestWalletAccount();
      setAccount(connectedAccount);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-zinc-950 text-sm font-black text-white">
            TF
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700">Token Launchpad</p>
            <h1 className="text-lg font-semibold text-zinc-950">Create Token</h1>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Ready to create
        </div>

        <button
          type="button"
          onClick={connectWallet}
          className="min-h-10 rounded-md border border-zinc-900 bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isConnecting}
        >
          {account ? shortenAddress(account) : isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
}
