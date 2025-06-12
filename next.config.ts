import type { NextConfig } from "next";
import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        pathname: '**', // allows any path
      },
      {
        protocol: 'https',
        hostname: 's3.mazzakotrip.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 's5g.s3.ap-south-1.amazonaws.com',
        pathname: '/**'
      },

    ],
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
