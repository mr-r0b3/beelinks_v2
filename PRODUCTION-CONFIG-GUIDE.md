# 🚀 Guia de Configuração para Produção - BeeLinks

## ✅ Deploy Realizado com Sucesso!
**URL de Produção:** https://beelinks-prod.vercel.app

---

## 📋 Checklist de Configuração

### **1. Configurar Variáveis de Ambiente no Vercel** ⚙️

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `beelinks-prod`
3. Vá para **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

```bash
# Variável 1
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co

# Variável 2  
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-anon-key-here
```

**❗ Importante:** 
- Use a URL e chave do seu projeto Supabase
- Encontre essas informações em: Supabase Dashboard > Settings > API

---

### **2. Configurar Supabase Authentication** 🔐

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **Authentication** > **URL Configuration**

**Site URL:**
```
https://beelinks-prod.vercel.app
```

**Redirect URLs (adicione uma por linha):**
```
https://beelinks-prod.vercel.app
https://beelinks-prod.vercel.app/login
https://beelinks-prod.vercel.app/signup
http://localhost:3000
```

---

### **3. Configurar CORS no Supabase** 🌐

1. No Supabase Dashboard
2. Vá para **Settings** > **API**
3. Na seção **CORS**, adicione:

**Allowed Origins:**
```
https://beelinks-prod.vercel.app
http://localhost:3000
```

---

### **4. Executar Scripts SQL no Supabase** 💾

Execute estes scripts **em ordem** no SQL Editor do Supabase:

#### **4.1. Schema Principal (se não executou ainda)**
```sql
-- Copie e cole o conteúdo de: database/supabase-schema-clean.sql
```

#### **4.2. Sistema de Avatars**
```sql
-- Copie e cole o conteúdo de: database/add-avatars-table-fixed.sql
```

#### **4.3. Bucket de Storage**
```sql
-- Copie e cole o conteúdo de: database/create-avatars-bucket.sql
```

#### **4.4. Políticas RLS**
```sql
-- Copie e cole o conteúdo de: database/fix-rls-policies.sql
```

#### **4.5. Verificação Final**
```sql
-- Copie e cole o conteúdo de: database/production-setup.sql
```

---

### **5. Testar a Aplicação** 🧪

Após configurar tudo:

1. **Acesse:** https://beelinks-prod.vercel.app
2. **Teste o cadastro:** Crie uma nova conta
3. **Teste o login:** Faça login com a conta criada
4. **Teste o upload de avatar:** Suba uma foto de perfil
5. **Teste a criação de links:** Adicione alguns links
6. **Teste o logout:** Saia e entre novamente

---

### **6. Monitoramento** 📊

**Logs do Vercel:**
- Dashboard > Project > Functions tab

**Logs do Supabase:**
- Dashboard > Logs > SQL Editor / Auth / Storage

**Problemas Comuns:**
- ❌ **401 Unauthorized:** Verifique as URLs de redirecionamento
- ❌ **CORS Error:** Verifique as origens permitidas
- ❌ **Bucket not found:** Execute o script create-avatars-bucket.sql
- ❌ **RLS Error:** Execute o script fix-rls-policies.sql

---

### **7. URLs Importantes** 🔗

| Serviço | URL |
|---------|-----|
| **Aplicação** | https://beelinks-prod.vercel.app |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **GitHub Repo** | https://github.com/mr-r0b3/beelinks_v2 |

---

### **8. Backup e Segurança** 🔒

**Variáveis Sensíveis:**
- ✅ Nunca commite arquivos .env no Git
- ✅ Use apenas NEXT_PUBLIC_ para variáveis do frontend
- ✅ Configure Row Level Security (RLS) no Supabase

**Backup:**
- ✅ Código no GitHub
- ✅ Banco de dados: Supabase faz backup automaticamente
- ✅ Storage: Supabase faz backup automaticamente

---

## 🎉 Conclusão

Seguindo este guia, sua aplicação estará 100% configurada e funcionando em produção!

**Próximos passos sugeridos:**
1. Configurar domínio personalizado (opcional)
2. Configurar analytics (Google Analytics, etc.)
3. Configurar monitoramento de uptime
4. Configurar notificações de erro

**Suporte:**
- Documentação do Vercel: https://vercel.com/docs
- Documentação do Supabase: https://supabase.com/docs
