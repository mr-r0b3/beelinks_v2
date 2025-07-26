# 🐝 BeeLinks - Guia de Implementação Supabase

## 📋 Visão Geral

Este guia detalha como implementar o Supabase no projeto BeeLinks, migrando do LocalStorage para um banco de dados PostgreSQL completo com autenticação, analytics avançados e funcionalidades em tempo real.

## 🚀 Configuração Inicial

### 1. **Criar Projeto no Supabase**

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização ou use existente
4. Clique em "New Project"
5. Configure:
   - **Name**: BeeLinks
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha mais próxima (South America)
6. Aguarde criação (2-3 minutos)

### 2. **Obter Credenciais**

No dashboard do projeto:
1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** 
   - **anon public key**

### 3. **Configurar Variáveis de Ambiente**

Crie `.env.local` na raiz do projeto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Opcional: Para funcionalidades avançadas
SUPABASE_SERVICE_ROLE_KEY=service_role_key_aqui
```

### 4. **Instalar Dependências**

```bash
npm install @supabase/supabase-js
```

## 🗄️ Setup do Banco de Dados

### 1. **Executar Schema SQL**

No Supabase Dashboard:
1. Vá em **SQL Editor**
2. Clique em "New Query"
3. Cole o conteúdo do arquivo `database/supabase-schema.sql`
4. Execute (Run)

### 2. **Configurar RLS (Row Level Security)**

As políticas já estão incluídas no schema. Verifique em:
**Authentication** → **Policies**

### 3. **Configurar Auth**

1. Vá em **Authentication** → **Settings**
2. Configure:
   - **Site URL**: `http://localhost:3000` (desenvolvimento)
   - **Redirect URLs**: `http://localhost:3000/**`

### 4. **Configurar Storage (Opcional)**

Para avatars e imagens:
1. Vá em **Storage**
2. Crie bucket: `avatars`
3. Configurar política pública

## 🔄 Migração dos Dados

### 1. **Migração Automática**

Adicione ao seu componente principal:

```javascript
// app/page.js
import { useEffect } from 'react';
import { autoMigrateOnLoad } from '../utils/migration';

export default function Home() {
  useEffect(() => {
    // Executar migração automática se necessário
    autoMigrateOnLoad();
  }, []);

  // resto do componente...
}
```

### 2. **Migração Manual**

```javascript
import { quickMigration } from '../utils/migration';

// Em um botão ou evento
const handleMigration = async () => {
  const result = await quickMigration();
  if (result.success) {
    console.log('Migração concluída!');
  }
};
```

### 3. **Backup dos Dados**

Antes da migração, sempre:

```javascript
import BeeLinksDataMigration from '../utils/migration';

const migration = new BeeLinksDataMigration();
migration.createLocalStorageBackup(); // Cria backup automático
```

## 🔧 Atualização do Código

### 1. **Substituir Imports de Storage**

**Antes:**
```javascript
import { loadLinks, saveLink } from '../utils/storage';
```

**Depois:**
```javascript
import { linksService } from '../lib/supabase';
```

### 2. **Atualizar Operações de Links**

**Antes:**
```javascript
// Carregar links
const links = loadLinks();

// Salvar link
saveLink(newLink);
```

**Depois:**
```javascript
// Carregar links
const user = await userService.getCurrentUser();
const links = await linksService.getUserLinks(user.id);

// Salvar link
await linksService.createLink(user.id, newLink);
```

### 3. **Adicionar Autenticação**

```javascript
import { authService } from '../lib/supabase';

// Login
const { user } = await authService.signIn(email, password);

// Verificar usuário atual
const user = await authService.getSession();
```

## 📊 Implementar Analytics

### 1. **Rastrear Cliques**

```javascript
import { analyticsService } from '../lib/supabase';

// Ao clicar em um link
const handleLinkClick = async (linkId) => {
  await analyticsService.trackLinkClick(linkId);
  // Redirecionar para URL
};
```

### 2. **Rastrear Visualizações**

```javascript
// No carregamento da página
useEffect(() => {
  const trackView = async () => {
    const user = await userService.getCurrentUser();
    if (user) {
      await analyticsService.trackProfileView(user.id);
    }
  };
  trackView();
}, []);
```

### 3. **Exibir Estatísticas**

```javascript
const [stats, setStats] = useState(null);

useEffect(() => {
  const loadStats = async () => {
    const user = await userService.getCurrentUser();
    const userStats = await analyticsService.getUserStats(user.id);
    setStats(userStats);
  };
  loadStats();
}, []);
```

## 🎨 Sistema de Temas

### 1. **Carregar Temas**

```javascript
import { themesService } from '../lib/supabase';

const [themes, setThemes] = useState([]);

useEffect(() => {
  const loadThemes = async () => {
    const user = await userService.getCurrentUser();
    const userThemes = await themesService.getUserThemes(user.id);
    setThemes(userThemes);
  };
  loadThemes();
}, []);
```

### 2. **Aplicar Tema**

```javascript
const applyTheme = async (themeId) => {
  const user = await userService.getCurrentUser();
  await themesService.setActiveTheme(user.id, themeId);
  
  // Atualizar CSS customizado
  document.documentElement.style.setProperty('--primary-color', theme.primary_color);
};
```

## 🔄 Real-time Updates

### 1. **Subscrever Mudanças nos Links**

```javascript
import { subscriptions } from '../lib/supabase';

useEffect(() => {
  const user = await userService.getCurrentUser();
  
  const subscription = subscriptions.subscribeToUserLinks(
    user.id,
    (payload) => {
      console.log('Link atualizado:', payload);
      // Atualizar estado local
      refreshLinks();
    }
  );

  return () => {
    subscriptions.unsubscribe(subscription);
  };
}, []);
```

### 2. **Analytics em Tempo Real**

```javascript
const subscription = subscriptions.subscribeToLinkAnalytics(
  linkId,
  (payload) => {
    // Atualizar contador de cliques em tempo real
    setClickCount(prev => prev + 1);
  }
);
```

## 🏷️ Sistema de Tags

### 1. **Gerenciar Tags**

```javascript
import { tagsService } from '../lib/supabase';

// Criar tag
const createTag = async (tagData) => {
  const user = await userService.getCurrentUser();
  await tagsService.createTag(user.id, tagData);
};

// Atribuir tag a link
const assignTag = async (linkId, tagId) => {
  await tagsService.assignTagToLink(linkId, tagId);
};
```

## 📱 QR Codes

### 1. **Gerar QR Code**

```javascript
import { qrService } from '../lib/supabase';

const generateQR = async () => {
  const user = await userService.getCurrentUser();
  const profile = await userService.getUserProfile(user.id);
  
  const qrData = {
    url: `${window.location.origin}/${profile.username}`,
    style: 'default',
    foreground_color: '#000000',
    background_color: '#FFFFFF'
  };
  
  const qrCode = await qrService.generateQRCode(user.id, qrData);
  return qrCode;
};
```

## 🔐 Configurações de Segurança

### 1. **Row Level Security (RLS)**

As políticas estão configuradas automaticamente. Principais regras:

- ✅ Usuários só acessam seus próprios dados
- ✅ Perfis públicos são visíveis para todos
- ✅ Analytics podem ser inseridos por qualquer visitante
- ✅ Apenas proprietário pode modificar dados

### 2. **Validação de Dados**

```javascript
// Validações automáticas no banco:
// - URLs devem ser válidas (regex)
// - Títulos mínimo 2 caracteres
// - Descrições mínimo 5 caracteres
// - Usernames únicos
```

## 🚀 Deploy em Produção

### 1. **Configurar Domínio**

No Supabase Dashboard:
1. **Authentication** → **Settings**
2. Atualizar **Site URL**: `https://seudominio.com`
3. Atualizar **Redirect URLs**: `https://seudominio.com/**`

### 2. **Variáveis de Ambiente Produção**

```bash
# Vercel/Netlify
NEXT_PUBLIC_SUPABASE_URL=sua_url_producao
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_producao
```

### 3. **Configurar CDN/Storage**

Para melhor performance:
1. Configure bucket público para avatars
2. Ative CDN no Supabase
3. Configure domínio customizado

## 📊 Monitoramento

### 1. **Dashboard Analytics**

O Supabase fornece:
- **Database**: Métricas de performance
- **Auth**: Usuários ativos/cadastros
- **API**: Requests e latência
- **Storage**: Uso de armazenamento

### 2. **Logs de Aplicação**

```javascript
// Logs customizados
console.log('BeeLinks Action:', {
  user: user.id,
  action: 'create_link',
  timestamp: new Date().toISOString()
});
```

## 🔧 Troubleshooting

### Problemas Comuns

**1. Erro de Conexão**
```javascript
import { utils } from '../lib/supabase';

// Verificar configuração
if (!utils.isConfigured()) {
  console.error('Supabase não configurado!');
}

// Testar conexão
const isConnected = await utils.checkConnection();
```

**2. RLS Negando Acesso**
- Verificar se usuário está autenticado
- Confirmar políticas estão ativas
- Testar com service_role temporariamente

**3. Migração Falhando**
- Verificar dados no LocalStorage
- Executar backup antes da migração
- Verificar logs no console

### Logs Úteis

```javascript
// Habilitar logs detalhados do Supabase
localStorage.setItem('supabase.debug', 'true');
```

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## ✅ Checklist de Implementação

- [ ] ✅ Projeto Supabase criado
- [ ] ✅ Schema executado
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Dependências instaladas
- [ ] ✅ Autenticação configurada
- [ ] ✅ Storage configurado (se necessário)
- [ ] ✅ Migração de dados executada
- [ ] ✅ Código atualizado para usar Supabase
- [ ] ✅ Analytics implementado
- [ ] ✅ Real-time subscriptions ativas
- [ ] ✅ Testes realizados
- [ ] ✅ Deploy em produção
- [ ] ✅ Monitoramento configurado

## 🎉 Próximos Passos

Após implementação completa:

1. **Funcionalidades Avançadas**
   - Sistema de seguidores
   - Compartilhamento de perfis
   - Templates de perfil
   - Integração com redes sociais

2. **Otimizações**
   - Cache inteligente
   - Pré-carregamento de dados
   - Lazy loading de componentes

3. **Analytics Avançados**
   - Dashboards personalizados
   - Relatórios semanais/mensais
   - Comparações de performance

A migração para Supabase transformará o BeeLinks de um projeto local em uma aplicação escalável, multi-usuário e com funcionalidades profissionais!
