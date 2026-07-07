"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { erc20Abi, factoryAddress, tokenLaunchpadAbi } from "../utils/contracts";
import { explorerAddressUrl, publicClient, shortenAddress } from "../utils/viemClient";

export default function TokenGrid({ refreshKey }) {
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <section className="min-w-0 rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-end justify-between gap-4 border-b border-zinc-200 p-4">
        <div>
          <p className="text-sm font-semibold text-teal-700">Created Tokens</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950">Token List</h2>
        </div>
        <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-600">
          {tokens.length} tokens
        </p>
      </div>

      {isLoading ? (
        <div className="p-4">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-6 text-zinc-600">
            Loading created tokens...
          </div>
        </div>
      ) : error ? (
        <div className="p-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-amber-900">
            {error}
          </div>
        </div>
      ) : tokens.length === 0 ? (
        <div className="p-4">
          <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
            <p className="text-lg font-semibold text-zinc-950">No tokens created yet</p>
            <p className="mt-2 text-sm text-zinc-500">New tokens will appear here after they are created.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 p-4 xl:grid-cols-2">
          {tokens.map((token) => (
            <article
              key={`${token.tokenAddress}-${token.createdAt}`}
              className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-zinc-950">{token.name}</h3>
                  <p className="mt-1 font-mono text-sm font-medium text-teal-700">{token.symbol}</p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
                  Token
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-zinc-500">Token link</dt>
                  <dd className="mt-1 font-mono text-zinc-900">
                    {explorerAddressUrl(token.tokenAddress) ? (
                      <a
                        href={explorerAddressUrl(token.tokenAddress)}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-4 hover:text-teal-700 hover:underline"
                      >
                        {shortenAddress(token.tokenAddress)}
                      </a>
                    ) : (
                      shortenAddress(token.tokenAddress)
                    )}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-3 border-y border-zinc-100 py-3">
                  <div>
                    <dt className="text-zinc-500">Starting supply</dt>
                    <dd className="mt-1 truncate font-semibold text-zinc-950">
                      {formatUnits(token.initialSupply, 18)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Current supply</dt>
                    <dd className="mt-1 truncate font-semibold text-zinc-950">
                      {formatUnits(token.totalSupply, 18)}
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-zinc-500">Created by</dt>
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
