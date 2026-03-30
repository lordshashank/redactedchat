import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://ghostbalance.chat", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://ghostbalance.chat/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://ghostbalance.chat/leaderboard", lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];
}
