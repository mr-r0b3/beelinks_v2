#!/bin/bash

# ====================================================================
# 🚀 BeeLinks - Script de Deploy para Vercel
# ====================================================================

echo "🐝 Preparando deploy do BeeLinks para Vercel..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Erro: Variáveis de ambiente do Supabase não configuradas!"
    echo ""
    echo "Configure no painel do Vercel:"
    echo "1. Vá para Settings > Environment Variables"
    echo "2. Adicione NEXT_PUBLIC_SUPABASE_URL"
    echo "3. Adicione NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    echo "Valores necessários:"
    echo "NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon"
    exit 1
fi

echo "✅ Variáveis de ambiente configuradas"
echo "🔧 Iniciando build..."

# Executar build
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "🚀 Deploy no Vercel pronto!"
else
    echo "❌ Erro no build"
    exit 1
fi
