/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage (replaces Cloudflare R2)
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // All routes: deny framing + security defaults
        source: '/((?!widget).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Widget route: allow embedding from any origin (it IS the embeddable widget)
        source: '/widget(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // No X-Frame-Options → browser allows cross-origin iframe
          // CSP frame-ancestors '*' explicitly permits all origins
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
    ]
  },
}

export default nextConfig
