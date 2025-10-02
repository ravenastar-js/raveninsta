/**
 * 🚪 Comando Sair - Remove sessão e dados de autenticação
 * @module commands/sair
 * @async
 * @description Limpa arquivos de sessão e criptografia do sistema
 */
async function execute() {
  try {
    const fs = require('fs').promises;
    const path = require('path');

    const sessionFile = path.join(process.cwd(), 'session_data.json');
    const keyFile = path.join(process.cwd(), 'session_key.bin');

    console.log('🚪 Removendo dados da sessão...');

    let removed = false;

    try {
      await fs.access(sessionFile);
      await fs.unlink(sessionFile);
      console.log('🗑️  Sessão removida');
      removed = true;
    } catch (error) {
    }

    try {
      await fs.access(keyFile);
      await fs.unlink(keyFile);
      console.log('🗑️  Chave removida');
      removed = true;
    } catch (error) {
    }

    if (!removed) {
      console.log('ℹ️  Nenhuma sessão encontrada para remover');
    } else {
      console.log('✅ Sessão removida com sucesso');
    }

  } catch (error) {
    console.log('❌ Erro ao sair:', error.message);
  }
}

/** @type {Object} Configuração do comando sair */
const config = {
  name: 'sair',
  description: 'Remover sessão atual e dados de criptografia'
};

module.exports = {
  execute,
  config
};