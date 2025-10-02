/**
 * 📊 Comando Status - Verifica status e validade da sessão
 * @module commands/status
 * @async
 * @description Verifica existência, validade e tempo restante da sessão atual
 */
async function execute() {
  try {
    const fs = require('fs').promises;
    const path = require('path');

    const sessionFile = path.join(process.cwd(), 'session_data.json');
    const keyFile = path.join(process.cwd(), 'session_key.bin');

    console.log('🔍 Verificando sessão...');

    try {
      await fs.access(sessionFile);
      const sessionStats = await fs.stat(sessionFile);
      
      let keyExists = false;
      try {
        await fs.access(keyFile);
        keyExists = true;
      } catch (error) {
      }

      const agora = new Date();
      const tempoDecorrido = agora - sessionStats.mtime;
      const horasDecorridas = tempoDecorrido / (1000 * 60 * 60);
      const ehRecente = horasDecorridas < 24;

      console.log('\n📊 STATUS DA SESSÃO:');
      console.log(`📁 Arquivo de sessão: ${path.basename(sessionFile)}`);
      console.log(`🔑 Arquivo de chave: ${path.basename(keyFile)} ${keyExists ? '✅' : '❌'}`);
      console.log(`⏰ Criada/Modificada: ${sessionStats.mtime.toLocaleString('pt-BR')}`);
      console.log(`🕐 Há ${horasDecorridas.toFixed(1)} horas`);
      
      if (ehRecente) {
        console.log('\n✅ Sessão ativa e recente (menos de 24 horas)');
        console.log('💡 Você pode usar: raveninsta buscar <usuario>');
      } else {
        console.log('\n⚠️  Sessão expirada (mais de 24 horas)');
        console.log('💡 Execute: raveninsta login para renovar');
      }

    } catch (error) {
      console.log('\n❌ Nenhuma sessão ativa encontrada');
      console.log('💡 Execute: raveninsta login para criar uma nova sessão');
    }

  } catch (error) {
    console.log('❌ Erro ao verificar sessão:', error.message);
  }
}

/** @type {Object} Configuração do comando status */
const config = {
  name: 'status',
  description: 'Verificar status e validade da sessão atual'
};

module.exports = {
  execute,
  config
};