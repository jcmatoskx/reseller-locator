import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // basePath is set via env var so local dev works without a prefix,
  // while the GitHub Actions build sets it to /reseller-locator
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
