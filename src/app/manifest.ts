import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoaTools",
    short_name: "MoaTools",
    description: "Free online calculators and everyday browser tools",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f4ef",
    theme_color: "#b84a30",
    lang: "mul",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
