const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer'); 
const { sessionManager } = require('./session');
const axios = require('axios');

class Scraper {
  constructor(outputDir = './perfis') {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    try {
      fs.ensureDirSync(this.outputDir);
    } catch (error) {
      console.log('❌ Erro ao criar diretório de saída:', error.message);
    }
  }

  getProfilePath(profileId) {
    return path.join(this.outputDir, profileId.toString());
  }

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

  async getProfileData(identifier) {
    try {
      const { sessionManager } = require('./session');
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

 async captureScreenshot(identifier, sessionData) { 
    let browser;
    
    try {
      console.log('📸 Capturando screenshot...');
      
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
      
      console.log('✅ Screenshot capturada');
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

  async getProfile(identifier, outputDir = './perfis', captureScreenshot = true) {
    try {
      if (outputDir !== './perfis') {
        this.outputDir = outputDir;
        this.ensureOutputDir();
      }

      console.log(`🎯 Analisando: ${identifier}`);
      
      const sessionData = await sessionManager.loadSession();
      
      const profileData = await this.getProfileData(identifier);
      

      let screenshotBuffer = null;
      if (captureScreenshot) {
        screenshotBuffer = await this.captureScreenshot(profileData.username, sessionData);
      }
      
      const saved = await this.saveProfileData(profileData.id, profileData, screenshotBuffer);
      
      if (saved) {
        console.log('💾 Dados salvos em:', this.getProfilePath(profileData.id));
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