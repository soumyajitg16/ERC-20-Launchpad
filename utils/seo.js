export const siteName = "TokenForge Launchpad";

export const siteDescription =
  "Create ERC20 tokens on Polygon Amoy with a wallet-connected launchpad powered by EIP-1167 token clones.";

export const siteKeywords = [
  "ERC20 launchpad",
  "create ERC20 token",
  "token creator",
  "Polygon Amoy",
  "web3 launchpad",
  "EIP-1167 clone factory",
  "TokenForge"
];

function normalizeSiteUrl(url) {
  if (!url) return "http://localhost:3000";
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withProtocol.replace(/\/$/, "");
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL
);

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
