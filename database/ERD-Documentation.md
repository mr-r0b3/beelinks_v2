# 🐝 BeeLinks - Diagrama Entidade-Relacionamento (ERD)

## 📋 Visão Geral da Arquitetura de Dados

Este documento apresenta o mapeamento completo do banco de dados do projeto BeeLinks para implementação no Supabase PostgreSQL, migrando do atual sistema LocalStorage.

## 🗄️ Entidades Principais

### 👤 **users** (Usuários)
```
┌─────────────────────────────────────────┐
│                 users                   │
├─────────────────────────────────────────┤
│ 🔑 id (UUID, PK)                       │
│ 📧 email (VARCHAR, UNIQUE)             │
│ 👤 username (VARCHAR, UNIQUE)          │
│ 📝 full_name (VARCHAR)                 │
│ 💬 bio (TEXT)                          │
│ 🖼️ avatar_url (TEXT)                   │
│ 🎨 theme_preference (VARCHAR)          │
│ 🌐 is_profile_public (BOOLEAN)         │
│ 🔗 custom_slug (VARCHAR, UNIQUE)       │
│ 📅 created_at (TIMESTAMP)              │
│ 📅 updated_at (TIMESTAMP)              │
│ 📅 last_login (TIMESTAMP)              │
│ ✅ email_verified (BOOLEAN)            │
│ 🟢 is_active (BOOLEAN)                 │
└─────────────────────────────────────────┘
```

### 🔗 **links** (Links dos Usuários)
```
┌─────────────────────────────────────────┐
│                 links                   │
├─────────────────────────────────────────┤
│ 🔑 id (UUID, PK)                       │
│ 👤 user_id (UUID, FK → users)          │
│ 📝 title (VARCHAR)                     │
│ 💬 description (TEXT)                  │
│ 🌐 url (TEXT)                          │
│ 🎯 icon (VARCHAR)                      │
│ 🟢 is_active (BOOLEAN)                 │
│ ⭐ is_featured (BOOLEAN)               │
│ 🔢 sort_order (INTEGER)               │
│ 🎨 background_color (VARCHAR)          │
│ 🎨 text_color (VARCHAR)                │
│ 📅 created_at (TIMESTAMP)              │
│ 📅 updated_at (TIMESTAMP)              │
└─────────────────────────────────────────┘
```

### 👥 **social_links** (Redes Sociais)
```
┌─────────────────────────────────────────┐
│             social_links                │
├─────────────────────────────────────────┤
│ 🔑 id (UUID, PK)                       │
│ 👤 user_id (UUID, FK → users)          │
│ 🏢 platform (VARCHAR)                  │
│ 👤 username (VARCHAR)                  │
│ 🌐 url (TEXT)                          │
│ 🎯 icon (VARCHAR)                      │
│ 👁️ is_visible (BOOLEAN)                │
│ 🔢 sort_order (INTEGER)               │
│ 📅 created_at (TIMESTAMP)              │
│ 📅 updated_at (TIMESTAMP)              │
└─────────────────────────────────────────┘
```

### 📊 **link_analytics** (Analytics dos Links)
```
┌─────────────────────────────────────────┐
│            link_analytics               │
├─────────────────────────────────────────┤
│ 🔑 id (UUID, PK)                       │
│ 🔗 link_id (UUID, FK → links)          │
│ 👤 user_id (UUID, FK → users)          │
│ 📊 event_type (VARCHAR)                │
│ 🌐 visitor_ip (INET)                   │
│ 🌍 visitor_country (VARCHAR)           │
│ 🏙️ visitor_city (VARCHAR)              │
│ 🖥️ user_agent (TEXT)                   │
│ 🔗 referer (TEXT)                      │
│ 📱 device_type (VARCHAR)               │
│ 🌐 browser (VARCHAR)                   │
│ 💻 os (VARCHAR)                        │
│ 📅 created_at (TIMESTAMP)              │
└─────────────────────────────────────────┘
```

### 📈 **profile_analytics** (Analytics do Perfil)
```
┌─────────────────────────────────────────┐
│           profile_analytics             │
├─────────────────────────────────────────┤
│ 🔑 id (UUID, PK)                       │
│ 👤 user_id (UUID, FK → users)          │
│ 🌐 visitor_ip (INET)                   │
│ 🌍 visitor_country (VARCHAR)           │
│ 🏙️ visitor_city (VARCHAR)              │
│ 🖥️ user_agent (TEXT)                   │
│ 🔗 referer (TEXT)                      │
│ ⏱️ session_duration (INTEGER)          │
│ 📄 pages_viewed (INTEGER)              │
│ 📱 device_type (VARCHAR)               │
│ 🌐 browser (VARCHAR)                   │
│ 💻 os (VARCHAR)                        │
│ 📺 screen_resolution (VARCHAR)         │
│ 📅 created_at (TIMESTAMP)              │
└─────────────────────────────────────────┘
```

### 🎨 **themes** (Temas Personalizados)
```
┌─────────────────────────────────────────┐
│                themes                   │
├─────────────────────────────────────────┤
│ 🔑 id (UUID, PK)                       │
│ 👤 user_id (UUID, FK → users)          │
│ 📝 name (VARCHAR)                      │
│ ⭐ is_default (BOOLEAN)                │
│ 🎨 primary_color (VARCHAR)             │
│ 🎨 secondary_color (VARCHAR)           │
│ 🎨 background_color (VARCHAR)          │
│ 🎨 text_color (VARCHAR)                │
│ 🎨 accent_color (VARCHAR)              │
│ 🔤 font_family (VARCHAR)               │
│ 📐 border_radius (INTEGER)             │
│ 🔲 button_style (VARCHAR)              │
│ 📅 created_at (TIMESTAMP)              │
│ 📅 updated_at (TIMESTAMP)              │
└─────────────────────────────────────────┘
```

### 🔐 **user_settings** (Configurações)
```
┌─────────────────────────────────────────┐
│             user_settings               │
├─────────────────────────────────────────┤
│ 🔑 id (UUID, PK)                       │
│ 👤 user_id (UUID, FK → users)          │
│ 📊 analytics_enabled (BOOLEAN)         │
│ 🌐 public_analytics (BOOLEAN)          │
│ 🔢 show_click_count (BOOLEAN)          │
│ 👁️ allow_link_preview (BOOLEAN)        │
│ 📧 email_notifications (BOOLEAN)       │
│ 📊 weekly_analytics_email (BOOLEAN)    │
│ 👥 new_follower_notification (BOOLEAN) │
│ 🎨 current_theme_id (UUID, FK)         │
│ 🖼️ show_avatar (BOOLEAN)               │
│ 💬 show_bio (BOOLEAN)                  │
│ 👥 show_social_links (BOOLEAN)         │
│ 🎨 custom_css (TEXT)                   │
│ 🔧 custom_head_code (TEXT)             │
│ 🔍 seo_title (VARCHAR)                 │
│ 🔍 seo_description (VARCHAR)           │
│ 📅 created_at (TIMESTAMP)              │
│ 📅 updated_at (TIMESTAMP)              │
└─────────────────────────────────────────┘
```

### 🏷️ **link_tags** (Tags para Links)
```
┌─────────────────────────────────────────┐
│               link_tags                 │
├─────────────────────────────────────────┤
│ 🔑 id (UUID, PK)                       │
│ 👤 user_id (UUID, FK → users)          │
│ 📝 name (VARCHAR)                      │
│ 🎨 color (VARCHAR)                     │
│ 💬 description (TEXT)                  │
│ 📅 created_at (TIMESTAMP)              │
└─────────────────────────────────────────┘
```

### 🔗 **link_tag_assignments** (Links ↔ Tags)
```
┌─────────────────────────────────────────┐
│          link_tag_assignments           │
├─────────────────────────────────────────┤
│ 🔗 link_id (UUID, FK → links)          │
│ 🏷️ tag_id (UUID, FK → link_tags)       │
│ 📅 assigned_at (TIMESTAMP)             │
└─────────────────────────────────────────┘
```

### 📱 **qr_codes** (QR Codes)
```
┌─────────────────────────────────────────┐
│               qr_codes                  │
├─────────────────────────────────────────┤
│ 🔑 id (UUID, PK)                       │
│ 👤 user_id (UUID, FK → users)          │
│ 📊 code_data (TEXT)                    │
│ 🖼️ image_url (TEXT)                    │
│ 🎨 style (VARCHAR)                     │
│ 🎨 foreground_color (VARCHAR)          │
│ 🎨 background_color (VARCHAR)          │
│ 📷 logo_enabled (BOOLEAN)              │
│ 📅 generated_at (TIMESTAMP)            │
│ 📊 download_count (INTEGER)            │
└─────────────────────────────────────────┘
```

## 🔗 Relacionamentos

### Relacionamentos Principais
```
users (1) ←→ (N) links
users (1) ←→ (N) social_links  
users (1) ←→ (N) themes
users (1) ←→ (1) user_settings
users (1) ←→ (N) link_tags
users (1) ←→ (1) qr_codes
users (1) ←→ (N) profile_analytics

links (1) ←→ (N) link_analytics
links (N) ←→ (N) link_tags [via link_tag_assignments]

themes (1) ←→ (N) user_settings
```

### Fluxo de Dados - Mapeamento do LocalStorage

| **LocalStorage Atual** | **Tabela Supabase** | **Transformação** |
|------------------------|---------------------|-------------------|
| `beelinks_profile` | `users` | Dados de perfil migram para tabela users |
| `beelinks_links` | `links` | Array de links vira registros individuais |
| `beelinks_theme` | `user_settings.current_theme_id` | Referência para tema ativo |
| Contador de cliques | `link_analytics` | Eventos detalhados de analytics |
| Stats simuladas | `profile_analytics` + `link_analytics` | Analytics reais e detalhados |

## 📊 Views Criadas

### **user_stats** - Estatísticas Agregadas
```sql
SELECT 
    user_id, username,
    total_links, total_clicks, 
    total_views, profile_views
FROM user_stats 
WHERE month = '2024-01-01'
```

### **popular_links** - Links Mais Populares
```sql
SELECT 
    title, url, username,
    click_count, view_count
FROM popular_links 
LIMIT 10
```

## 🔐 Segurança (RLS)

### Políticas Implementadas
- ✅ **Users**: Ver/editar apenas próprios dados
- ✅ **Links**: CRUD apenas para próprio usuário
- ✅ **Analytics**: Inserção pública, visualização restrita
- ✅ **Settings**: Acesso exclusivo do proprietário
- ✅ **Themes**: Gestão individual por usuário

## 🚀 Funcionalidades Expandidas

### Novas Capacidades vs LocalStorage

| **Funcionalidade** | **LocalStorage** | **Supabase** |
|-------------------|------------------|--------------|
| **Persistência** | ❌ Local apenas | ✅ Nuvem + Sync |
| **Analytics** | ❌ Básico | ✅ Detalhado + Geo |
| **Temas** | ❌ Fixo | ✅ Personalizável |
| **Tags** | ❌ Não existe | ✅ Organização |
| **QR Codes** | ❌ Não existe | ✅ Compartilhamento |
| **Multi-device** | ❌ Não funciona | ✅ Sincronizado |
| **Backup** | ❌ Manual | ✅ Automático |
| **Performance** | ❌ Limitado | ✅ Otimizado |

## 🏗️ Próximos Passos para Implementação

### 1. **Setup Inicial**
```bash
# Executar no Supabase SQL Editor
psql -f supabase-schema.sql
```

### 2. **Configurar Autenticação**
- Habilitar Auth no Supabase
- Configurar provedores (email, Google, GitHub)

### 3. **Migração de Dados**
- Script para migrar dados do LocalStorage
- Validação e limpeza de dados existentes

### 4. **Atualização do Frontend**
- Substituir calls localStorage por Supabase client
- Implementar real-time subscriptions
- Adicionar funcionalidades de analytics

### 5. **Deploy e Testes**
- Configurar variables de ambiente
- Testes de performance e segurança
- Monitoring e observabilidade

## 📈 Benefícios da Migração

### **Escalabilidade**
- 💾 Dados ilimitados vs 5-10MB LocalStorage
- 👥 Multi-usuário nativo
- 🌍 CDN global automático

### **Funcionalidades**
- 📊 Analytics avançados em tempo real
- 🎨 Temas personalizáveis por usuário  
- 🏷️ Sistema de tags e organização
- 📱 QR codes automáticos
- 🔗 URLs personalizadas

### **Experiência do Usuário**
- 🔄 Sincronização entre dispositivos
- ⚡ Performance otimizada
- 🔒 Segurança enterprise-grade
- 📱 API REST/GraphQL disponível

Este esquema está pronto para implementação no Supabase e representa uma evolução significativa do sistema atual, mantendo toda funcionalidade existente e adicionando capacidades empresariais.
