const { login } = require('../session');

/**
 * 🔐 Comando Login - Autenticação no Instagram via navegador
 * @module commands/login
 * @async
 * @description Inicia processo de login interativo no Instagram
 */
async function execute() {
  try {
    console.log('🔐 Iniciando processo de login...');
    await login();
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
  }
}

/** @type {Object} Configuração do comando login */
const config = {
  name: 'login',
  description: 'Fazer login no Instagram via navegador'
};

module.exports = {
  execute,
  config
};