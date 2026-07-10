import { absoluteUrl } from "../utils/seo";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
