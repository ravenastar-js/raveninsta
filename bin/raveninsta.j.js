#!/usr/bin/env node

const { program } = require('commander');

program
  .name('raveninsta')
  .description('Raveninsta | Ferramenta CLI para Instagram - ID ↔ Username')
  .version('1.0.0');

// COMANDO PRINCIPAL: BUSCAR
program
  .command('buscar <alvo>')
  .description('Busca perfil por ID ou username')
  .option('-s, --screenshot', 'Tirar foto do perfil', true)
  .option('-o, --pasta <caminho>', 'Onde salvar os arquivos', './perfis')
  .action(async (alvo, options) => {
    try {
      // Verificar se a sessão existe ANTES de inicializar o Scraper
      const fs = require('fs').promises;
      const path = require('path');
      const sessionFile = path.join(process.cwd(), 'session_data.json');

      try {
        await fs.access(sessionFile);
      } catch (error) {
        console.log('❌ Nenhuma sessão encontrada');
        console.log('💡 Execute: raveninsta login');
        return;
      }

      // Agora inicializar o Scraper (já sabemos que a sessão existe)
      const Scraper = require('../lib/scraper');
      const scraper = new Scraper(options.pasta);
      await scraper.getProfile(alvo, options.pasta, options.screenshot);
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }
  });

// COMANDO: login
program
  .command('login')
  .description('Fazer login no Instagram')
  .action(async () => {
    const { login } = require('../lib/session');
    await login();
  });

// COMANDO: status
program
  .command('status')
  .description('Verificar status do login')
  .action(async () => {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      // Verificar se o arquivo de sessão existe SEM inicializar o sessionManager
      const sessionFile = path.join(process.cwd(), 'session_data.json');

      try {
        await fs.access(sessionFile);
        // Arquivo existe, verificar se é recente
        const stats = await fs.stat(sessionFile);
        const ehRecente = (Date.now() - stats.mtime.getTime()) < (24 * 60 * 60 * 1000);

        if (ehRecente) {
          console.log('✅ Sessão ativa (arquivo recente)');
          console.log('📁 Arquivo:', sessionFile);
        } else {
          console.log('⚠️  Sessão pode ter expirado (arquivo antigo)');
        }
      } catch (error) {
        console.log('❌ Nenhuma sessão encontrada');
        console.log('💡 Execute: raveninsta login');
      }

    } catch (error) {
      console.log('❌ Erro ao verificar sessão:', error.message);
    }
  });

// COMANDO: sair
program
  .command('sair')
  .description('Remover sessão e dados')
  .action(async () => {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      const sessionFile = path.join(process.cwd(), 'session_data.json');
      const keyFile = path.join(process.cwd(), 'session_key.bin');

      let removed = false;

      // Remover arquivos individualmente
      try {
        await fs.access(sessionFile);
        await fs.unlink(sessionFile);
        console.log('🗑️  Sessão removida');
        removed = true;
      } catch (error) {
        // Arquivo não existe, tudo bem
      }

      try {
        await fs.access(keyFile);
        await fs.unlink(keyFile);
        console.log('🗑️  Chave removida');
        removed = true;
      } catch (error) {
        // Arquivo não existe, tudo bem
      }

      if (!removed) {
        console.log('ℹ️  Nenhuma sessão encontrada para remover');
      } else {
        console.log('✅ Sessão removida com sucesso');
      }

    } catch (error) {
      console.log('❌ Erro ao sair:', error.message);
    }
  });

// COMANDO: ajuda
program
  .command('ajuda')
  .description('Mostrar ajuda completa')
  .action(() => {
    console.log(`
🛠️ COMANDOS Raveninsta:

• raveninsta login          - Fazer login
• raveninsta buscar <alvo>  - Buscar perfil
• raveninsta status         - Verificar sessão  
• raveninsta sair           - Remover sessão
• raveninsta ajuda          - Esta mensagem

    `);
  });

program.parse();