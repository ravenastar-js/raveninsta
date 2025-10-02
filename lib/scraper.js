const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer'); 
const axios = require('axios');

/**
 * 🕷️ Scraper - Coleta dados e screenshots de perfis do Instagram
 * @class Scraper
 * @description Gerencia coleta de dados, captura de screenshots e salvamento de perfis
 */
class Scraper {
  /**
   * 🏗️ Construtor do Scraper
   * @param {string} outputDir - Diretório de saída para os arquivos
   */
  constructor(outputDir = './perfis') {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  /** 📁 Garantir que diretório de saída existe */
  ensureOutputDir() {
    try {
      fs.ensureDirSync(this.outputDir);
    } catch (error) {
      console.log('❌ Erro ao criar diretório de saída:', error.message);
    }
  }

  /**
   * 🗂️ Obter caminho do perfil
   * @param {string} profileId - ID do perfil
   * @returns {string} Caminho completo do diretório do perfil
   */
  getProfilePath(profileId) {
    return path.join(this.outputDir, profileId.toString());
  }

  /**
   * 📄 Gerar relatório formatado do perfil
   * @async
   * @param {string} profilePath - Caminho do diretório do perfil
   * @param {Object} data - Dados do perfil
   */
  async generateReport(profilePath, data) {
    const reportContent = `
🔍 RELATÓRIO DO PERFIL - Raveninsta
📅 Gerado em: ${new Date().toLocaleString('pt-BR')}
==================================================

🔄 MAPEAMENTO BIDIRECIONAL
------------------------------
🆔 ID: ${data.id}
🔤 Username: @${data.username}

📊 ${data.analysis_count || 1} análises realizadas
👤 DADOS DO PERFIL
------------------------------
👤 Nome: ${data.full_name || 'N/A'}
📌 Biografia: ${data.biography || 'N/A'}

📊 ESTATÍSTICAS
------------------------------
👥 Seguidores: ${data.followers?.toLocaleString() || 'N/A'}
➡️  Seguindo: ${data.following?.toLocaleString() || 'N/A'}
📝 Posts: ${data.posts_count?.toLocaleString() || 'N/A'}
🔒 Privado: ${data.is_private ? 'Sim' : 'Não'}
✅ Verificado: ${data.is_verified ? 'Sim' : 'Não'}

${data.username_history && data.username_history.length > 1 ? `
📝 HISTÓRICO DE USERNAMES
------------------------------
${data.username_history.map((username, index) => 
  `${username} ${index === data.username_history.length - 1 ? '🟢 ATUAL' : ''}`
).join(' → ')}
` : ''}

📅 Primeira análise: ${data.first_analysis ? new Date(data.first_analysis).toLocaleString('pt-BR') : 'N/A'}
🔄 Última atualização: ${data.last_updated ? new Date(data.last_updated).toLocaleString('pt-BR') : 'N/A'}
    `.trim();

    try {
      await fs.writeFile(path.join(profilePath, 'relatorio.txt'), reportContent);
    } catch (error) {
      console.log('❌ Erro ao gerar relatório:', error.message);
    }
  }

  /**
   * 💾 Salvar dados do perfil com histórico
   * @async
   * @param {string} profileId - ID do perfil
   * @param {Object} data - Dados atuais do perfil
   * @param {Buffer} [screenshotBuffer=null] - Buffer da screenshot
   * @returns {Promise<boolean>} True se salvamento foi bem-sucedido
   */
  async saveProfileData(profileId, data, screenshotBuffer = null) {
    const profilePath = this.getProfilePath(profileId);
    
    try {
      await fs.ensureDir(profilePath);
      
      let existingData = {};
      const dataFile = path.join(profilePath, 'dados.json');
      if (await fs.pathExists(dataFile)) {
        existingData = await fs.readJson(dataFile);
      }

      const updatedData = {
        ...existingData,
        ...data,
        last_updated: new Date().toISOString(),
        analysis_count: (existingData.analysis_count || 0) + 1
      };

      if (existingData.username && existingData.username !== data.username) {
        updatedData.username_history = [
          ...(existingData.username_history || [existingData.username]),
          data.username
        ];
      } else if (!existingData.username_history && data.username) {
        updatedData.username_history = [data.username];
      }

      if (!existingData.first_analysis) {
        updatedData.first_analysis = new Date().toISOString();
      }

      await fs.writeJson(dataFile, updatedData, { spaces: 2 });
      
      if (screenshotBuffer) {
        await fs.writeFile(path.join(profilePath, 'perfil.png'), screenshotBuffer);
      }
      
      await this.generateReport(profilePath, updatedData);
      
      return true;
    } catch (error) {
      console.log('❌ Erro ao salvar dados do perfil:', error.message);
      return false;
    }
  }

  /**
   * 🔍 Obter dados do perfil via API
   * @async
   * @param {string} identifier - ID ou username do perfil
   * @returns {Promise<Object>} Dados formatados do perfil
   * @throws {Error} Se perfil não for encontrado
   */
  async getProfileData(identifier) {
    try {
      const { getSessionManager } = require('./session');
      const sessionManager = getSessionManager();
      const sessionData = await sessionManager.loadSession();
      
      console.log('🔍 Buscando dados do perfil...');
      
      const response = await axios.get(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${identifier}`,
        {
          headers: {
            'User-Agent': sessionData['User-Agent'],
            'Cookie': sessionData.Cookie,
            'X-IG-App-ID': '936619743392459',
            'X-IG-WWW-Claim': '0'
          },
          timeout: 15000
        }
      );

      if (response.data && response.data.data && response.data.data.user) {
        const user = response.data.data.user;
        
        const profileData = {
          id: user.id,
          username: user.username,
          full_name: user.full_name || '',
          biography: user.biography || '',
          followers: user.edge_followed_by?.count || 0,
          following: user.edge_follow?.count || 0,
          posts_count: user.edge_owner_to_timeline_media?.count || 0,
          is_private: user.is_private || false,
          is_verified: user.is_verified || false,
          profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url || ''
        };

        console.log('✅ Dados do perfil obtidos com sucesso');
        return profileData;
      } else {
        throw new Error('Resposta da API inválida');
      }
      
    } catch (error) {
      console.log('❌ Erro ao obter dados do perfil:', error.message);
      
      if (/^\d+$/.test(identifier)) {
        throw new Error(`Não foi possível encontrar perfil com ID: ${identifier}`);
      } else {
        throw new Error(`Não foi possível encontrar perfil com username: ${identifier}`);
      }
    }
  }

  /**
   * 📸 Capturar screenshot do perfil
   * @async
   * @param {string} identifier - Username do perfil
   * @param {Object} sessionData - Dados da sessão autenticada
   * @returns {Promise<Buffer|null>} Buffer da imagem ou null em caso de erro
   */
  async captureScreenshot(identifier, sessionData) { 
    let browser;
    
    try {
      console.log('📸 Capturando screenshot do perfil...');
      
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1920,1080'
        ]
      });
      
      const page = await browser.newPage();
      await page.setUserAgent(sessionData['User-Agent']);
      
      await page.setCookie(...sessionData.cookies);
      
      await page.goto(`https://www.instagram.com/${identifier}/`, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const screenshot = await page.screenshot({ 
        fullPage: false,
        type: 'png'
      });
      
      console.log('✅ Screenshot capturada com sucesso');
      return screenshot;
      
    } catch (error) {
      console.log('❌ Erro ao capturar screenshot:', error.message);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * 🎯 Analisar perfil completo
   * @async
   * @param {string} identifier - ID ou username do perfil
   * @param {string} outputDir - Diretório de saída
   * @param {boolean} captureScreenshot - Se deve capturar screenshot
   * @returns {Promise<Object>} Dados completos do perfil
   * @throws {Error} Se análise falhar
   */
  async getProfile(identifier, outputDir = './perfis', captureScreenshot = true) {
    try {
      if (outputDir !== './perfis') {
        this.outputDir = outputDir;
        this.ensureOutputDir();
      }

      console.log(`🎯 Analisando: ${identifier}`);
      
      const { getSessionManager } = require('./session');
      const sessionManager = getSessionManager();
      const sessionData = await sessionManager.loadSession();
      
      const profileData = await this.getProfileData(identifier);

      let screenshotBuffer = null;
      if (captureScreenshot) {
        screenshotBuffer = await this.captureScreenshot(profileData.username, sessionData);
      }
      
      const saved = await this.saveProfileData(profileData.id, profileData, screenshotBuffer);
      
      if (saved) {
        console.log('\n💾 Dados salvos em:', this.getProfilePath(profileData.id));
        console.log(`👤 Perfil: @${profileData.username} (ID: ${profileData.id})`);
        console.log(`📊 Seguidores: ${profileData.followers?.toLocaleString() || 'N/A'}`);
        console.log(`📝 Posts: ${profileData.posts_count?.toLocaleString() || 'N/A'}`);
      }
      
      return profileData;
      
    } catch (error) {
      console.log('❌ Erro na análise do perfil:', error.message);
      throw error;
    }
  }
}

module.exports = Scraper;