import type { NextConfig } from "next";

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOriginHost(value: string): string | null {
  try {
    const parsed = new URL(value);
    return parsed.host;
  } catch {
    return value.replace(/^https?:\/\//, "").trim() || null;
  }
}

const trustedOrigins = parseList(process.env.TRUSTED_ORIGINS);
const trustedOriginHosts = Array.from(
  new Set(
    trustedOrigins
      .map(normalizeOriginHost)
      .filter((value): value is string => Boolean(value)),
  ),
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: trustedOriginHosts,
  experimental: {
    serverActions:
      trustedOriginHosts.length > 0
        ? { allowedOrigins: trustedOriginHosts }
        : undefined,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Origin-Agent-Cluster",
            value: "?1",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
