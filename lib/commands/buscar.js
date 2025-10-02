/**
 * 🔍 Comando Buscar - Busca perfis do Instagram por ID ou username
 * @module commands/buscar
 * @async
 * @param {string} alvo - ID numérico ou username do perfil
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.screenshot - Capturar screenshot do perfil
 * @param {string} options.pasta - Diretório para salvar arquivos
 */
async function execute(alvo, options) {
  try {
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

    console.log(`🎯 Iniciando análise: ${alvo}`);
    
    const Scraper = require('../scraper');
    const scraper = new Scraper(options.pasta);
    await scraper.getProfile(alvo, options.pasta, options.screenshot);
  } catch (error) {
    console.log('❌ Erro na busca:', error.message);
  }
}

/** @type {Object} Configuração do comando buscar */
const config = {
  name: 'buscar <alvo>',
  description: 'Buscar perfil por ID numérico ou username',
  options: [
    {
      flags: '-s, --screenshot',
      description: 'Capturar screenshot do perfil',
      defaultValue: true
    },
    {
      flags: '-o, --pasta <caminho>',
      description: 'Diretório para salvar os arquivos',
      defaultValue: './perfis'
    }
  ]
};

module.exports = {
  execute,
  config
};