/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
  },
  basePath: process.env.GITHUB_ACTIONS ? '/pdf-generator' : '',
  assetPrefix: process.env.GITHUB_ACTIONS ? '/pdf-generator/' : ''
}

module.exports = nextConfig
