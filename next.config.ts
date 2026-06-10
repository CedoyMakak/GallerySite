import type { NextConfig } from "next";

const remotePatterns: Array<{ protocol: "https"; hostname: string }> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com"
  }
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    remotePatterns.push({
      protocol: "https",
      hostname: new URL(supabaseUrl).hostname
    });
  } catch {
    // invalid URL in env — skip
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns
  }
};

export default nextConfig;
