
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pfutircafogpepbvhdgc.supabase.co'], // Para imagens do Supabase
  },
  // Configuração específica para produção com GitHub Pages
  ...(process.env.DEPLOY_TARGET === 'github-pages' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    assetPrefix: '/beelinks_v2/',
    basePath: '/beelinks_v2',
  })
}

module.exports = nextConfig
