
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/beelinks_v2/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/beelinks_v2' : '',
}

module.exports = nextConfig
