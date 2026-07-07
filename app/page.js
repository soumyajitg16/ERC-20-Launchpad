"use client";

import { useState } from "react";
import LaunchForm from "../components/LaunchForm";
import Navbar from "../components/Navbar";
import TokenGrid from "../components/TokenGrid";
import { creationFeeEth, factoryAddress } from "../utils/contracts";

export default function Home() {
  const [account, setAccount] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen text-zinc-950">
      <Navbar account={account} setAccount={setAccount} />

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:pt-8">
        <section className="mb-5 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-700">Token Creator</p>
              <h2 className="mt-1 text-2xl font-semibold leading-tight text-zinc-950">
                Create your own token in a few steps.
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm lg:min-w-[620px] lg:grid-cols-4">
              <div className="border-t border-zinc-200 pt-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <p className="text-zinc-500">Launch cost</p>
                <p className="mt-1 font-semibold text-zinc-950">{creationFeeEth} ETH</p>
              </div>
              <div className="border-t border-zinc-200 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                <p className="text-zinc-500">Creation type</p>
                <p className="mt-1 font-semibold text-zinc-950">Low cost</p>
              </div>
              <div className="border-t border-zinc-200 pt-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <p className="text-zinc-500">App setup</p>
                <p
                  className={`mt-1 font-semibold ${
                    factoryAddress ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {factoryAddress ? "Ready" : "Needs setup"}
                </p>
              </div>
              <div className="border-t border-zinc-200 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                <p className="text-zinc-500">Wallet</p>
                <p className="mt-1 font-mono text-xs font-semibold text-zinc-950">
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
      </div>
    </main>
  );
}
