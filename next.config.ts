import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    // ローカル開発時は最適化をスキップ（プライベートIPへのSSRFブロックを回避）
    unoptimized: isDev,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
