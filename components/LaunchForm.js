"use client";

import { useState } from "react";
import { parseEther, parseUnits } from "viem";
import { creationFeeEth, factoryAddress, tokenLaunchpadAbi } from "../utils/contracts";
import {
  explorerTxUrl,
  getWalletClient,
  parseViemError,
  publicClient,
  requestWalletAccount
} from "../utils/viemClient";

export default function LaunchForm({ account, setAccount, onTokenLaunched }) {
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    initialSupply: ""
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [txHash, setTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function launchToken(event) {
    event.preventDefault();

    if (!factoryAddress) {
      setStatus({
        type: "error",
        message: "The token creator is not connected yet. Deploy the contract and add its address to .env.local."
      });
      return;
    }

    setIsSubmitting(true);
    setTxHash("");
    setStatus({ type: "pending", message: "Opening your wallet for approval..." });

    try {
      const activeAccount = account || (await requestWalletAccount());
      setAccount(activeAccount);

      const walletClient = getWalletClient(activeAccount);
      const scaledSupply = parseUnits(form.initialSupply, 18);

      // viem simulates the call before submitting so common contract reverts are
      // surfaced early with ABI-decodable custom error data.
      const { request } = await publicClient.simulateContract({
        account: activeAccount,
        address: factoryAddress,
        abi: tokenLaunchpadAbi,
        functionName: "launchToken",
        args: [form.name.trim(), form.symbol.trim().toUpperCase(), scaledSupply],
        value: parseEther(creationFeeEth)
      });

      setStatus({ type: "pending", message: "Sending your token creation request..." });
      const hash = await walletClient.writeContract(request);
      setTxHash(hash);
      setStatus({ type: "pending", message: "Waiting for the network to confirm..." });

      await publicClient.waitForTransactionReceipt({ hash });

      setStatus({ type: "success", message: "Your token was created successfully." });
      setForm({ name: "", symbol: "", initialSupply: "" });
      onTokenLaunched?.();
    } catch (error) {
      setStatus({ type: "error", message: parseViemError(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Create Your Token</p>
            <h2 className="mt-1 text-2xl font-semibold text-zinc-900">Token Details</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Enter the core token metadata and confirm the launch transaction.
            </p>
          </div>
          <div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
            {creationFeeEth} ETH
          </div>
        </div>
      </div>

      <form className="grid gap-3 p-5" onSubmit={launchToken}>
        <label className="grid min-w-0 gap-2 text-sm font-medium text-zinc-700">
          Token name
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            required
            placeholder="My Community Token"
            className="min-h-11 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-zinc-900 outline-none transition placeholder:text-zinc-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr] lg:grid-cols-1 xl:grid-cols-[0.8fr_1.2fr]">
          <label className="grid min-w-0 gap-2 text-sm font-medium text-zinc-700">
            Short symbol
            <input
              name="symbol"
              value={form.symbol}
              onChange={updateField}
              required
              maxLength={12}
              placeholder="ACME"
              className="min-h-11 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 uppercase text-zinc-900 outline-none transition placeholder:text-zinc-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          <label className="grid min-w-0 gap-2 text-sm font-medium text-zinc-700">
            Starting supply
            <input
              name="initialSupply"
              value={form.initialSupply}
              onChange={updateField}
              required
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="1000000"
              className="min-h-11 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-zinc-900 outline-none transition placeholder:text-zinc-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
        </div>

        <div className="border-y border-zinc-200 py-3 text-sm text-zinc-600">
          <div className="flex items-center justify-between gap-3">
            <span>Launch cost</span>
            <span className="font-semibold text-zinc-900">{creationFeeEth} ETH</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span>Number precision</span>
            <span className="font-semibold text-zinc-900">18</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-md bg-indigo-600 px-4 font-semibold text-white shadow-glow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating..." : "Create Token"}
        </button>
      </form>

      {status.message ? (
        <div className="px-5 pb-5">
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              status.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            <p>{status.message}</p>
            {txHash ? (
              <a
                className="mt-2 inline-flex break-all font-medium text-indigo-700 underline-offset-4 hover:underline"
                href={explorerTxUrl(txHash) || "#"}
                target={explorerTxUrl(txHash) ? "_blank" : undefined}
                rel="noreferrer"
              >
                {explorerTxUrl(txHash) ? "View confirmation" : txHash}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
