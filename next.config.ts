import type { NextConfig } from "next";
import createMDX from '@next/mdx'
import remarkGFM from "remark-gfm"

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    domains: [
      'fastly.picsum.photos',
      's3.mazzakotrip.com'
    ],
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGFM],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
