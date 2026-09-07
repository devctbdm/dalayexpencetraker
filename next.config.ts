import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Arena previews are served through a sandbox-specific e2b.app subdomain.
  allowedDevOrigins: ["*.e2b.app"],
}

export default nextConfig
