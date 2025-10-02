/**
 * 🆘 Comando de Ajuda - Exibe guia completo de uso
 * @module commands/ajuda
 * @async
 */
async function execute() {
  console.log(`
🦅 RAVENINSTA - Ferramenta CLI para Instagram
📊 Mapeamento bi-direcional: ID ↔ Username

🛠️ COMANDOS DISPONÍVEIS:

🔐 AUTENTICAÇÃO
  raveninsta login          - Fazer login no Instagram via navegador
  raveninsta status         - Verificar status e validade da sessão
  raveninsta sair           - Remover sessão e dados locais

🔍 BUSCA E ANÁLISE
  raveninsta buscar <alvo>  - Buscar perfil por ID ou username
    Opções:
      -s, --screenshot      - Capturar screenshot do perfil (padrão: true)
      -o, --pasta <caminho> - Diretório para salvar arquivos (padrão: ./perfis)

❓ AJUDA
  raveninsta ajuda          - Mostrar esta mensagem de ajuda
  raveninsta --help         - Ajuda detalhada dos comandos

📋 EXEMPLOS PRÁTICOS:
  raveninsta buscar instagram
  raveninsta buscar 123456789
  raveninsta buscar @usuario -o ./investigacao
  raveninsta buscar target_user --no-screenshot

📁 ESTRUTURA GERADA DURANTE USO:
📂 [diretório-atual]/
├── 📂 auth/
│   ├── 🔐 session_data.json             # Sessão criptografada (gerado no login)
│   └── 🔑 session_key.bin               # Chave de criptografia (gerado no login)
└── 📂 perfis/ (ou pasta especificada)
    └── 📂 [ID]/
        ├── 🖼️ perfil.png                # Screenshot do perfil
        ├── 📄 relatorio.txt             # Relatório formatado
        └── 📊 dados.json                # Dados completos em JSON (com histórico)

⚠️  IMPORTANTE:
  • Requer Node.js 16.0.0 ou superior
  • Primeiro execute 'raveninsta login' para autenticar
  • Sessões expiram após 24 horas por segurança
  • Use responsavelmente e respeite os ToS do Instagram
  • Mantenha os dados de sessão em local seguro
  `);
}

/** @type {Object} Configuração do comando ajuda */
const config = {
  name: 'ajuda',
  description: 'Mostrar ajuda completa e exemplos de uso'
};

module.exports = {
  execute,
  config
};