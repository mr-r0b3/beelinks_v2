# 🐝 BeeLinks - Agregador de Links Pessoal
## Preview
![image](https://github.com/user-attachments/assets/ca7cb7a6-27dd-4dc4-afbc-4d46f10fe19b)

## 📋 Sobre o Projeto

BeeLinks é um agregador de links pessoal desenvolvido como MVP para a disciplina de Linguagens de Script. O projeto permite criar uma página personalizada para centralizar todos os seus links importantes em um só lugar, similar ao Linktree.

## 🎯 Objetivos Principais

- **Centralização de Links**: Reunir todos os links importantes em uma única página
- **Interface Intuitiva**: Design moderno e responsivo com tema claro/escuro
- **Persistência de Dados**: Armazenamento local dos dados usando LocalStorage
- **Experiência do Usuário**: Animações suaves e feedback visual
- **Rastreamento Básico**: Contagem de cliques e visualizações

## ✨ Funcionalidades Implementadas

### 🔧 Funcionalidades Principais
- ✅ Adicionar/remover links personalizados
- ✅ Detecção automática de ícones baseada na URL
- ✅ **Fotos de perfil aleatórias** que mudam a cada atualização
- ✅ **Botão para gerar nova foto** manualmente
- ✅ Contagem de cliques por link
- ✅ Estatísticas de visualizações totais
- ✅ Alternância entre tema claro e escuro
- ✅ Design responsivo para mobile/desktop
- ✅ Animações CSS personalizadas

### 🎨 Interface
- ✅ Design inspirado no Linktree
- ✅ Paleta de cores temática (amarelo/preto/cinza)
- ✅ Ícones Font Awesome
- ✅ Transições suaves
- ✅ Modal para adicionar links

## 🏗️ Arquitetura Técnica

### Critérios de Avaliação Atendidos

1. **✅ Programação Funcional**
   - Funções puras em `linkManager.js`
   - Imutabilidade nos dados
   - Composição de funções

2. **✅ Tratamento de Eventos**
   - Event listeners para interações do usuário
   - Delegação de eventos
   - Handlers funcionais

3. **✅ Estrutura com ESM**
   - Módulos ES6 organizados por responsabilidade
   - Imports/exports explícitos
   - Separação de responsabilidades

4. **✅ Pacotes com ViteJS**
   - Configuração Vite para desenvolvimento
   - Hot Module Replacement
   - Build otimizado

5. **✅ Páginas Dinâmicas com LocalStorage**
   - Persistência de links, perfil e configurações
   - Renderização dinâmica baseada em dados
   - Estado reativo da aplicação

### 📁 Estrutura de Arquivos

```
beelinks_v2/
├── index.html              # Página principal
├── styles.css              # Estilos CSS customizados
├── package.json             # Configuração do projeto
├── vite.config.js          # Configuração do Vite
└── src/
    ├── main.js             # Arquivo principal da aplicação
    ├── modules/
    │   ├── linkManager.js   # Lógica de negócio dos links
    │   ├── storage.js       # Gerenciamento do LocalStorage
    │   ├── ui.js           # Manipulação da interface
    │   └── events.js       # Gerenciamento de eventos
    └── utils/
        └── helpers.js      # Funções utilitárias
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16+ recomendada)
- npm ou yarn

### Instalação e Execução

1. **Clone o repositório:**
```bash
git clone [url-do-repositorio]
cd beelinks_v2
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute em modo desenvolvimento:**
```bash
npm run dev
```

4. **Acesse no navegador:**
```
http://localhost:3000
```

### Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build

## 🔧 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Build Tool**: Vite
- **Styling**: TailwindCSS (via CDN), CSS customizado
- **Icons**: Font Awesome
- **Storage**: LocalStorage API
- **Fonts**: Google Fonts (Inter)

## 📱 Funcionalidades Detalhadas

### Gerenciamento de Links
- Adicionar novos links com título, URL e descrição
- Detecção automática de ícones para plataformas populares
- Validação de URLs
- Rastreamento de cliques
- Ordenação por data de criação

### Personalização
- Tema claro/escuro com persistência
- Perfil personalizável
- Estatísticas em tempo real
- Interface responsiva

### Dados e Persistência
- Todos os dados salvos no LocalStorage
- Estado reativo da aplicação
- Backup automático das configurações

## 🎨 Design System

### Cores
- **Primária**: #FFD700 (Amarelo Bee)
- **Secundária**: #FFC107 (Amarelo Escuro)
- **Fundo Escuro**: #1A1A1A, #2D2D2D
- **Fundo Claro**: #F5F5F5, #FFFFFF

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

## 🔮 Roadmap Futuras Implementações

- [ ] Sistema de autenticação
- [ ] Compartilhamento de perfis
- [ ] Analytics avançados
- [ ] Temas personalizáveis
- [ ] Integração com APIs sociais
- [ ] Export/import de dados
- [ ] PWA (Progressive Web App)

## 📊 Critérios de Avaliação - Status

| Item | Etapa | Requisito | Status |
|------|-------|-----------|--------|
| 1 | Etapa I | Programação funcional | ✅ |
| 2 | Etapa I | Tratamento de Eventos | ✅ |
| 3 | Etapa I | Estrutura com ESM | ✅ |
| 4 | Etapa I | Pacotes com ViteJS | ✅ |
| 5 | Etapa I | Páginas dinâmicas com LocalStorage | ✅ |

## 🤝 Contribuições

Este é um projeto acadêmico para a disciplina de Linguagens de Script. Sugestões e melhorias são bem-vindas!

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com 💛 para a disciplina de Linguagens de Script**
