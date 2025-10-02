/**
 * 📂 Sistema de Carregamento de Comandos - Lazy Loading
 * @module commands/index
 * @description Gerencia o carregamento sob demanda dos comandos para otimização
 */

/** 
 * 🎯 Carregar comando específico (método alternativo)
 * @param {string} commandName - Nome do comando a ser carregado
 * @returns {Object|null} Módulo do comando ou null se não encontrado
 */
function getCommand(commandName) {
  switch (commandName) {
    case 'buscar':
      return require('./buscar');
    case 'login':
      return require('./login');
    case 'status':
      return require('./status');
    case 'sair':
      return require('./sair');
    case 'ajuda':
      return require('./ajuda');
    default:
      return null;
  }
}

/** 🔧 Exportação com getters para carregamento lazy */
module.exports = {
  /** @returns {Object} Comando de busca de perfis */
  get buscar() { return require('./buscar'); },
  
  /** @returns {Object} Comando de autenticação */
  get login() { return require('./login'); },
  
  /** @returns {Object} Comando de verificação de sessão */
  get status() { return require('./status'); },
  
  /** @returns {Object} Comando de limpeza de sessão */
  get sair() { return require('./sair'); },
  
  /** @returns {Object} Comando de ajuda completa */
  get ajuda() { return require('./ajuda'); }
};