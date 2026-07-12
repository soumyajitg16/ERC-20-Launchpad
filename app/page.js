"use client";

import { useState } from "react";
import Footer from "../components/Footer";
import LaunchForm from "../components/LaunchForm";
import Navbar from "../components/Navbar";
import TokenGrid from "../components/TokenGrid";
import { creationFeeEth } from "../utils/contracts";

export default function Home() {
  const [account, setAccount] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen text-zinc-900">
      <Navbar account={account} setAccount={setAccount} />

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:pt-8">
        <section className="mb-5 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-5">
            <p className="text-sm font-semibold text-indigo-700">Token Creator</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-zinc-900">
              Create ERC20 tokens on Polygon Amoy in a few steps.
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Set the name, symbol, and starting supply, then launch it from your connected wallet.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid w-full gap-0 text-sm sm:grid-cols-3">
              <div className="border-b border-zinc-200 px-5 py-4 sm:border-b-0 sm:border-r">
                <p className="text-zinc-600">Launch cost</p>
                <p className="mt-1 font-semibold text-zinc-900">{creationFeeEth} ETH</p>
              </div>
              <div className="border-b border-zinc-200 px-5 py-4 sm:border-b-0 sm:border-r">
                <p className="text-zinc-600">Creation type</p>
                <p className="mt-1 font-semibold text-zinc-900">EIP-1167 Clone</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-zinc-600">Wallet</p>
                <p className="mt-1 font-mono text-xs font-semibold text-zinc-900">
                  {account ? account.slice(0, 6) + "..." + account.slice(-4) : "Disconnected"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <LaunchForm
            account={account}
            setAccount={setAccount}
            onTokenLaunched={() => setRefreshKey((value) => value + 1)}
          />
          <TokenGrid refreshKey={refreshKey} />
        </div>

        <Footer />
      </div>
    </main>
  );
}
