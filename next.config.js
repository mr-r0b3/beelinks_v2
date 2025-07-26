
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'pfutircafogpepbvhdgc.supabase.co', // Para imagens do Supabase
      'api.dicebear.com', // Para avatars gerados
    ],
  },
  // Configuração para diferentes ambientes de deploy
  ...(process.env.DEPLOY_TARGET === 'github-pages' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    assetPrefix: '/beelinks_v2/',
    basePath: '/beelinks_v2',
  }),
  // Configuração para Vercel (padrão)
  ...(process.env.VERCEL && {
    poweredByHeader: false,
    generateEtags: false,
  })
}

module.exports = nextConfig
