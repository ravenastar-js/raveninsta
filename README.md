<div align="center">

# 🤖 Raveninsta
### ✨ CLI Tool para Instagram - Mapeamento bi-direcional: ID ↔ Username

<a href="https://www.npmjs.com/package/raveninsta" target="_blank"><img src="https://img.shields.io/badge/-raveninsta-c40404?style=flat-square&labelColor=c40404&logo=npm&logoColor=white&link=https://www.npmjs.com/package/raveninsta" height="40" /></a>  
 <a href="https://www.npmjs.com/package/raveninsta" target="_blank"><img alt="NPM Version" src="https://img.shields.io/npm/v/raveninsta?style=flat-square&logo=npm&labelColor=c40404&color=c40404" height="40" ></a>

[![⭐ Stars](https://img.shields.io/github/stars/ravenastar-js/raveninsta?style=for-the-badge&label=%E2%AD%90%20Stars&color=2d7445&logo=star&logoColor=white&labelColor=444&radius=10)](https://github.com/ravenastar-js/raveninsta/stargazers)
[![🔱 Forks](https://img.shields.io/github/forks/ravenastar-js/raveninsta?style=for-the-badge&label=%F0%9F%94%B1%20Forks&color=2d7445&logo=git&logoColor=white&labelColor=444&radius=10)](https://github.com/ravenastar-js/raveninsta/network/members)
[![🕒 Last Commit](https://img.shields.io/github/last-commit/ravenastar-js/raveninsta?style=for-the-badge&label=%F0%9F%95%92%20Last%20Commit&color=2d7445&logo=clock&logoColor=white&labelColor=444&radius=10)](https://github.com/ravenastar-js/raveninsta/commits/all)
[![📦 Repo Size](https://img.shields.io/github/repo-size/ravenastar-js/raveninsta?style=for-the-badge&label=%F0%9F%93%A6%20Repo%20Size&color=2d7445&logo=database&logoColor=white&labelColor=444&radius=10)](https://github.com/ravenastar-js/raveninsta)
[![⚙️ Node.js](https://img.shields.io/badge/%E2%9A%99%EF%B8%8F%20Node.js-16.0%2B-green?style=for-the-badge&logo=nodedotjs&color=2d7445&logoColor=white&labelColor=444&radius=10)](https://nodejs.org/pt/download)


![Raveninsta](https://i.imgur.com/Isj8YRZ.png)

</div>

Ferramenta CLI para investigação de perfis do Instagram com mapeamento bidirecional entre ID e username. **Publicado no NPM** para instalação global rápida.

<details>
<summary>📥 Como instalar o NodeJS?</summary>

- [COMO INSTALAR NODE JS NO WINDOWS?](https://youtu.be/-jft_9PlffQ)
</details>

## 🚀 Recursos Principais

- 🔄 **Mapeamento bidirecional** - Converte ID ⇄ Username automaticamente
- 🔍 **Detecção inteligente** - Reconhece automaticamente o tipo de entrada
- 📊 **Dados públicos** - Coleta informações básicas do perfil
- 🖼️ **Screenshot opcional** - Captura da página do perfil
- 📝 **Relatórios organizados** - Exporta em TXT e JSON
- 🔒 **Sessão segura** - Criptografia AES-256 para dados de login
- 🔄 **Histórico de mudanças** - Rastreia alterações de username
- 📦 **Instalação global** - Disponível via npm

## 📦 Instalação Rápida

```bash
npm i -g raveninsta          # ✅ Recomendado
npm install -g raveninsta    # ✅ Completo

# Após instalação, use em qualquer lugar:
raveninsta --help
```

## 🔍 VERIFICAR INSTALAÇÃO
```bash
npm ls -g raveninsta         # ✅ Listar pacote
npm list -g raveninsta       # ✅ Completo
raveninsta --version         # ✅ Versão instalada
```

## 🗑️ DESINSTALAR GLOBALMENTE
```bash
npm un -g raveninsta         # ✅ Recomendado  
npm uninstall -g raveninsta  # ✅ Completo
npm remove -g raveninsta     # ✅ Alternativo
```

**💡 Dica:** Com a instalação global, você pode usar `raveninsta` de qualquer diretório no seu sistema.

## 🔑 Configuração Inicial

### Primeiro Uso - Login Necessário

```bash
raveninsta login
```

📝 **Processo de login:**
1. O navegador será aberto automaticamente na página de login do Instagram
2. **Faça o login manualmente** no navegador que abriu
3. Aguarde o redirecionamento para o feed principal
4. O navegador fechará automaticamente após o login ser detectado
5. Sua sessão será salva com criptografia AES-256

💡 **Dica:** Use uma conta alternativa do Instagram dedicada para a ferramenta

### 🔒 Arquivos de Sessão

Após o login, são gerados na pasta do usuário:
- **session_data.json** - Cookies e dados de sessão criptografados
- **session_key.bin** - Chave de criptografia AES-256

**ℹ️ Importante:** Esses arquivos contêm tokens de acesso à sua conta. Mantenha-os seguros e não compartilhe.

## 🛠️ Como Usar

### Comandos Principais

```bash
# Busca por username ou ID (detecção automática)
raveninsta buscar usuario123
raveninsta buscar 123456789

# Opções adicionais
raveninsta buscar usuario123 --no-screenshot
raveninsta buscar usuario123 -o ./investigacoes

# Gerenciamento de sessão
raveninsta status
raveninsta sair

# Ajuda e informações
raveninsta --help
raveninsta --version
```

## 📁 Estrutura do Projeto

```
raveninsta 📦
├── 📂 bin/
│   └── 🔧 raveninsta.js                 # Ponto de entrada principal da CLI
├── 📂 lib/
│   ├── 🔐 session.js                    # Gerenciador de sessão e criptografia (lazy loading)
│   ├── 🌐 instagram-api.js              # Integração com API do Instagram (classe)
│   ├── 🕷️ scraper.js                    # Coleta de dados e screenshots
│   └── 📂 commands/                     # COMANDOS MODULARIZADOS
│       ├── 🔍 buscar.js                 # Comando de busca de perfis
│       ├── 🔐 login.js                  # Comando de autenticação
│       ├── 📊 status.js                 # Comando de verificação de sessão (não-invasivo)
│       ├── 🚪 sair.js                   # Comando de limpeza de sessão
│       └── ❓ ajuda.js                  # Comando de ajuda
├── 📦 package.json                      # Configurações e dependências do pacote
└── 📖 README.md                         # Documentação do projeto

# Estrutura gerada durante uso:
📂 [diretório-atual]/
├── 🔐 session_data.json                 # Sessão criptografada (gerado no login)
├── 🔑 session_key.bin                   # Chave de criptografia (gerado no login)
└── 📂 perfis/ (ou pasta especificada)
    └── 📂 [ID]/
        ├── 🖼️ perfil.png                # Screenshot do perfil
        ├── 📄 relatorio.txt             # Relatório formatado
        └── 📊 dados.json                # Dados completos em JSON (com histórico)
```

## 🔄 Mapeamento Bidirecional

A ferramenta identifica automaticamente o tipo de entrada:

- **🔤 Username → ID**: Encontra o identificador numérico único
- **🔢 ID → Username**: Recupera o username atual
- **🔄 Detecção automática**: Funciona com ambos os formatos

## 🖼️ Screenshots

**Captura básica** da página inicial do perfil:
- 🖥️ Resolução: 1920x1080 pixels
- ⏱️ Momento: Após carregamento inicial  
- 🔄 Substituição: Cada nova análise sobrescreve a anterior
- ❌ Limitações: Pode falhar em perfis privados

**Desativar:** Use `--no-screenshot`

## ⚠️ Recomendações de Segurança

- **🔒 Use conta alternativa** - Crie uma conta específica para a ferramenta
- **🚫 Evite conta pessoal** - Não use sua conta principal com dados sensíveis
- **📁 Proteja os arquivos** - `session_data.json` e `session_key.bin` contêm tokens de acesso
- **🔐 Não compartilhe** - Quem tiver os arquivos pode acessar a conta vinculada
- **🧹 Limpe após uso** - Execute `raveninsta sair` para remover tokens
- **⏰ Sessão temporária** - Tokens têm validade limitada pelo Instagram

## 🎯 Fluxo de Trabalho Recomendado

```bash
# 1. Instalar a ferramenta
npm install -g raveninsta

# 2. Fazer login uma vez
raveninsta login

# 3. Verificar sessão
raveninsta status

# 4. Investigar perfis
raveninsta buscar usuario-alvo
raveninsta buscar 123456789 -o ./minha-investigacao

# 5. Limpar sessão ao finalizar
raveninsta sair
```

## ❓ FAQ

<details>
<summary>🤔 Por que preciso fazer login?</summary>

O Instagram requer autenticação válida para acessar dados via API, mesmo os públicos. O login fornece os tokens de sessão necessários.

</details>

<details>
<summary>🔐 Meus dados de login estão seguros?</summary>

Sim! A ferramenta:
- Não armazena sua senha em nenhum momento
- Usa criptografia AES-256 nos arquivos de sessão
- Mantém apenas tokens temporários de autenticação
- Funciona exclusivamente com dados públicos

</details>

<details>
<summary>🔄 Como funciona o mapeamento bidirecional?</summary>

O sistema detecta automaticamente se a entrada é:
- **Username** (texto): Busca o ID numérico correspondente
- **ID** (numérico): Busca o username atual do perfil

A conversão é feita automaticamente em ambas as direções.

</details>

<details>
<summary>🆔 Qual e a importância dos IDs de Usuário?</summary>

O **ID de usuário** em plataformas digitais é um identificador numérico único atribuído a uma conta no momento de sua criação. Diferentemente do nome de usuário, que pode ser alterado, o ID permanece constante, servindo como uma referência fixa para identificar a conta.

### ✅ Benefícios de obter o ID de usuário:

- **Rastreamento consistente** - Permite acompanhar contas mesmo após alterações no nome de usuário
- **Identificação precisa** - Facilita a identificação exata em análises técnicas ou investigações
- **Documentação confiável** - Auxilia na geração de relatórios consistentes para fins legais ou forenses
- **Integração de dados** - Possibilita o cruzamento de informações entre diferentes sistemas ou plataformas
- **Monitoramento eficiente** - É fundamental para o acompanhamento e análise de contas em ferramentas especializadas

> 💡 **Dica profissional**: Em investigações digitais, sempre registre o ID junto com o username para garantir rastreabilidade a longo prazo.

</details>

<details>
<summary>📦 Qual a vantagem de instalar via npm?</summary>

- ✅ **Instalação rápida** - Um comando simples
- ✅ **Atualizações fáceis** - `npm update -g raveninsta`
- ✅ **Uso global** - Funciona em qualquer diretório
- ✅ **Gerenciamento centralizado** - Via npm
- ✅ **Versões organizadas** - Controle de releases

</details>

<details>
<summary>📸 Para que serve a screenshot?</summary>

É uma captura visual da página do perfil no momento da análise, útil para documentação. Pode ser desativada com `--no-screenshot`.

</details>

<details>
<summary>🚫 O que a ferramenta NÃO faz?</summary>

- ❌ Não coleta mensagens ou dados privados  
- ❌ Não interage com outros usuários
- ❌ Não realiza ações na plataforma
- ❌ Não burla limitações do Instagram
- ❌ Não acessa informações de seguidores individuais

</details>

<details>
<summary>🐛 Problemas comuns e soluções</summary>

**Sessão inválida ou expirada:**
```bash
raveninsta sair
raveninsta login
```

**Erro de instalação:**
```bash
npm uninstall -g raveninsta
npm install -g raveninsta
```

**Login não detectado:**
- Aguarde o redirecionamento completo para o feed
- Verifique se bloqueadores de pop-up estão desativados
- Certifique-se de que o login foi bem-sucedido

**Problemas de screenshot:**
- Use `--no-screenshot` para desativar a captura
- Verifique se o perfil não é privado

</details>

## 🔗 Links Oficiais

- **📦 [Pacote no NPM](https://www.npmjs.com/package/raveninsta)**
- **📖 [Código Fonte](https://github.com/ravenastar-js/raveninsta)**

## ⚠️ Aviso Legal e Ético

**🎓 Esta ferramenta é para fins educacionais, investigativos e éticos.**

- 📜 Respeite os termos de serviço do Instagram
- 🔒 Use com responsabilidade e ética  
- 📁 Mantenha os dados coletados de forma segura
- 🔐 Proteja os arquivos de sessão
- ⚖️ Você é responsável pelo uso adequado

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

*📦 Pacote NPM • 🔍 Apenas dados públicos • 🔒 Sessão criptografada • ⚖️ Uso educacional*
