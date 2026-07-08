"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { erc20Abi, factoryAddress, tokenLaunchpadAbi } from "../utils/contracts";
import { explorerAddressUrl, publicClient, shortenAddress } from "../utils/viemClient";

export default function TokenGrid({ refreshKey }) {
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllTokens, setShowAllTokens] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTokens() {
      if (!factoryAddress) {
        setIsLoading(false);
        setError("The token creator is not connected yet. Add the deployed contract address to show created tokens.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const results = await publicClient.readContract({
          address: factoryAddress,
          abi: tokenLaunchpadAbi,
          functionName: "getAllTokens"
        });

        const tokensWithSupply = await Promise.all(
          results.map(async (token) => {
            const totalSupply = await publicClient.readContract({
              address: token.tokenAddress,
              abi: erc20Abi,
              functionName: "totalSupply"
            });

            return {
              ...token,
              totalSupply
            };
          })
        );

        if (isMounted) setTokens([...tokensWithSupply].reverse());
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.shortMessage || "Unable to load created tokens.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTokens();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const displayedTokens = showAllTokens ? tokens : tokens.slice(0, 2);

  async function copyTokenAddress(address) {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      window.setTimeout(() => setCopiedAddress(""), 1600);
    } catch {
      setCopiedAddress("");
    }
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-end justify-between gap-4 border-b border-zinc-200 p-5">
        <div>
          <p className="text-sm font-semibold text-indigo-700">Created Tokens</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">Token List</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Review the newest launches first. The first two are shown by default.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {tokens.length > 2 ? (
            <button
              type="button"
              onClick={() => setShowAllTokens((value) => !value)}
              className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              {showAllTokens ? "Show less" : "View all"}
            </button>
          ) : null}
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-600">
            {tokens.length} tokens
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-6 text-zinc-600">
            Loading created tokens...
          </div>
        </div>
      ) : error ? (
        <div className="p-5">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-amber-900">
            {error}
          </div>
        </div>
      ) : tokens.length === 0 ? (
        <div className="p-5">
          <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
            <p className="text-lg font-semibold text-zinc-900">No tokens created yet</p>
            <p className="mt-2 text-sm text-zinc-600">New tokens will appear here after they are created.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {displayedTokens.map((token) => (
            <article
              key={`${token.tokenAddress}-${token.createdAt}`}
              className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-zinc-900">{token.name}</h3>
                  <p className="mt-1 font-mono text-sm font-medium text-indigo-700">{token.symbol}</p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
                  Token
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-zinc-600">Token Address</dt>
                  <dd className="mt-1 flex min-w-0 items-center gap-2 font-mono text-zinc-900">
                    <span className="min-w-0 truncate">
                      {explorerAddressUrl(token.tokenAddress) ? (
                        <a
                          href={explorerAddressUrl(token.tokenAddress)}
                          target="_blank"
                          rel="noreferrer"
                          className="underline-offset-4 hover:text-indigo-700 hover:underline"
                        >
                          {shortenAddress(token.tokenAddress)}
                        </a>
                      ) : (
                        shortenAddress(token.tokenAddress)
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyTokenAddress(token.tokenAddress)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-700"
                      title="Copy token address"
                      aria-label="Copy token address"
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
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                    {explorerAddressUrl(token.tokenAddress) ? (
                      <a
                        href={explorerAddressUrl(token.tokenAddress)}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-700"
                        title="Verify token"
                        aria-label="Verify token"
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
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                          <path d="m9 12 2 2 4-5" />
                        </svg>
                      </a>
                    ) : (
                      <span
                        className="grid h-8 w-8 shrink-0 cursor-not-allowed place-items-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-300"
                        title="Add an explorer URL to verify tokens"
                        aria-label="Token verification unavailable"
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
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                          <path d="m9 12 2 2 4-5" />
                        </svg>
                      </span>
                    )}
                    {copiedAddress === token.tokenAddress ? (
                      <span className="text-xs font-sans font-semibold text-emerald-700">Copied</span>
                    ) : null}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-3 border-y border-zinc-100 py-3">
                  <div>
                    <dt className="text-zinc-600">Starting supply</dt>
                    <dd className="mt-1 truncate font-semibold text-zinc-900">
                      {formatUnits(token.initialSupply, 18)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-600">Current supply</dt>
                    <dd className="mt-1 truncate font-semibold text-zinc-900">
                      {formatUnits(token.totalSupply, 18)}
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-zinc-600">Created by</dt>
                  <dd className="mt-1 font-mono text-zinc-900">{shortenAddress(token.owner)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
