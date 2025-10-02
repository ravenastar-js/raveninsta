#!/usr/bin/env node

const { program } = require('commander');
const commands = require('../lib/commands');

/**
 * 🦅 Raveninsta CLI - Ponto de entrada principal
 * @description Ferramenta para mapeamento bi-direcional Instagram ID ↔ Username
 * @version 1.0.0
 */
program
  .name('raveninsta')
  .description('🦅 Raveninsta | Ferramenta CLI para Instagram - Mapeamento bi-direcional: ID ↔ Username')
  .version('1.0.0')
  .usage('<comando> [opções]')
  .addHelpText('before', `
██████╗  █████╗ ██╗   ██╗███████╗███╗   ██╗██╗███╗   ██╗███████╗████████╗ █████╗ 
██╔══██╗██╔══██╗██║   ██║██╔════╝████╗  ██║██║████╗  ██║██╔════╝╚══██╔══╝██╔══██╗
██████╔╝███████║██║   ██║█████╗  ██╔██╗ ██║██║██╔██╗ ██║███████╗   ██║   ███████║
██╔══██╗██╔══██║╚██╗ ██╔╝██╔══╝  ██║╚██╗██║██║██║╚██╗██║╚════██║   ██║   ██╔══██║
██║  ██║██║  ██║ ╚████╔╝ ███████╗██║ ╚████║██║██║ ╚████║███████║   ██║   ██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝
`);

/** 🔧 Registrar todos os comandos disponíveis */
Object.keys(commands).forEach(commandName => {
  const command = commands[commandName];
  if (command.config) {
    const cmd = program
      .command(command.config.name)
      .description(command.config.description);
    
    if (command.config.options) {
      command.config.options.forEach(option => {
        cmd.option(option.flags, option.description, option.defaultValue);
      });
    }
    
    cmd.action(command.execute);
  }
});

/** 📚 Texto de ajuda personalizado */
program.addHelpText('after', `

📖 COMANDOS DISPONÍVEIS:

🔐 AUTENTICAÇÃO
  login                           Fazer login no Instagram via navegador
  status                          Verificar status e validade da sessão
  sair                            Remover sessão e dados locais

🔍 BUSCA E ANÁLISE
  buscar <alvo> [opções]          Buscar perfil por ID ou username
    -s, --screenshot              Capturar screenshot do perfil (padrão: true)
    -o, --pasta <caminho>         Diretório para salvar arquivos (padrão: ./perfis)

❓ AJUDA
  ajuda                           Mostrar ajuda completa com exemplos
  --help                          Mostrar esta ajuda técnica

🚀 EXEMPLOS RÁPIDOS:
  $ raveninsta login
  $ raveninsta buscar instagram
  $ raveninsta buscar 123456789 --no-screenshot
  $ raveninsta buscar @usuario -o ./investigacao
  $ raveninsta status

📁 ESTRUTURA:
  • Sessão: session_data.json (criptografado)
  • Dados: perfis/[ID]/{dados.json, relatorio.txt, perfil.png}

🔗 MAIS INFORMAÇÃO:
  • Execute 'raveninsta ajuda' para guia completo
  • Sessões expiram em 24h por segurança
  • Use responsavelmente
`);

/** 🎯 Executar ajuda se nenhum comando for fornecido */
if (!process.argv.slice(2).length) {
  const ajudaCommand = commands.ajuda;
  if (ajudaCommand && ajudaCommand.execute) {
    ajudaCommand.execute();
  } else {
    program.outputHelp();
  }
} else {
  program.parse();
}