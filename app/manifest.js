import { siteDescription, siteName } from "../utils/seo";

export default function manifest() {
  return {
    name: siteName,
    short_name: "TokenForge",
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
