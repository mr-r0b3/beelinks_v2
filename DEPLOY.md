# 🚀 Deploy do BeeLinks no GitHub Pages

## Problema Identificado
O Tailwind CSS não estava aparecendo no GitHub Pages porque:
1. O GitHub Pages serve arquivos estáticos
2. Não processa o Tailwind configurado localmente
3. Precisa de CSS pré-compilado ou CDN

## ✅ Soluções Implementadas

### **Opção 1: CDN do Tailwind (Mais Simples)**
Modifiquei o `index.html` para usar o CDN do Tailwind com configuração inline:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    'bee-yellow': '#FFD700',
                    'bee-dark-yellow': '#FFC107',
                    'bee-black': '#1A1A1A',
                    'bee-gray': '#2D2D2D',
                    'bee-light-gray': '#F5F5F5',
                    'bee-white': '#FFFFFF'
                }
            }
        }
    }
</script>
```

### **Opção 2: GitHub Actions (Automático)**
Criei `.github/workflows/deploy.yml` para build automático:
- Instala dependências
- Roda `npm run build`
- Publica pasta `dist` no GitHub Pages

### **Opção 3: Arquivo Específico para GitHub Pages**
Criei `github-pages.html` com todas as configurações otimizadas.

## 📋 Passos para Deploy

### **Método 1: Usando CDN (Recomendado)**
1. Faça commit das mudanças no `index.html`
2. Push para o repositório
3. Configure GitHub Pages para usar branch `main`
4. ✅ Site funcionará imediatamente

### **Método 2: Usando Build Automático**
1. Push o código com `.github/workflows/deploy.yml`
2. Configure GitHub Pages para usar "GitHub Actions"
3. ✅ Build automático a cada push

### **Método 3: Build Manual**
```bash
npm run build
git add dist/
git commit -m "Add build files"
git push
```

## 🔧 Configurações do GitHub Pages

1. Vá em `Settings` → `Pages`
2. Source: "Deploy from a branch" ou "GitHub Actions"
3. Branch: `main` (ou `gh-pages` se usar Actions)
4. Folder: `/ (root)` ou `/dist`

## ✨ Resultado Esperado

Após o deploy, seu site terá:
- ✅ Tailwind CSS funcionando
- ✅ Todas as cores personalizadas
- ✅ Modo escuro/claro
- ✅ Responsividade
- ✅ Funcionalidades JavaScript

## 🐛 Troubleshooting

**Se Tailwind ainda não aparecer:**
1. Verifique se o CDN está carregando (F12 → Network)
2. Teste usando `github-pages.html` temporariamente
3. Limpe cache do navegador (Ctrl+F5)

**Se JavaScript não funcionar:**
1. Verifique console (F12)
2. Confirme caminhos relativos nos imports
3. Use `github-pages.html` como base

## 📱 Teste Local

Para testar se funcionará no GitHub Pages:
```bash
# Simula servidor estático
npx serve .
# ou
python -m http.server 8000
```

Acesse `localhost:8000` - deve funcionar igual ao GitHub Pages.

---

**Status**: ✅ Pronto para deploy
**Última atualização**: 13 de Junho de 2025
