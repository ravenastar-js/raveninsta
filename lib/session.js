const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');

/**
 * 🔐 Session Manager - Gerenciador de sessão com criptografia
 * @class SessionManager
 * @description Gerencia autenticação, criptografia e validação de sessão do Instagram
 */
class SessionManager {
  constructor() {
    this.sessionFile = path.join(process.cwd(), 'session_data.json');
    this.keyFile = path.join(process.cwd(), 'session_key.bin');
    this.profilesDir = path.join(process.cwd(), 'perfis');
    
    this.ensureDirectories();
    
    this._encryptionKey = null;
  }

  /** 📁 Garantir que diretórios necessários existem */
  ensureDirectories() {
    try {
      fs.ensureDirSync(path.dirname(this.sessionFile));
      fs.ensureDirSync(this.profilesDir);
    } catch (error) {
      console.log('❌ Erro ao criar diretórios:', error.message);
    }
  }

  /** 🔑 Getter para chave de criptografia (lazy loading) */
  get encryptionKey() {
    if (!this._encryptionKey) {
      this._encryptionKey = this.getEncryptionKey();
    }
    return this._encryptionKey;
  }

  /**
   * 🗝️ Obter chave de criptografia
   * @returns {Buffer} Chave de criptografia
   */
  getEncryptionKey() {
    try {
      if (fs.existsSync(this.keyFile)) {
        return fs.readFileSync(this.keyFile);
      } else {
        const key = crypto.randomBytes(32);
        fs.writeFileSync(this.keyFile, key);
        console.log('🔑 Nova chave de criptografia gerada');
        return key;
      }
    } catch (error) {
      const fallbackKey = crypto.createHash('sha256')
        .update(process.platform + process.arch + __dirname)
        .digest();
      console.log('⚠️  Usando chave de criptografia fallback');
      return fallbackKey;
    }
  }

  /**
   * 🔒 Criptografar dados da sessão
   * @param {Object} data - Dados da sessão para criptografar
   * @returns {Object} Dados criptografados
   * @throws {Error} Se criptografia falhar
   */
  encryptData(data) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        iv: iv.toString('hex'),
        data: encrypted,
        authTag: authTag.toString('hex'),
        encrypted: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log('❌ Erro ao criptografar dados:', error.message);
      throw error;
    }
  }

  /**
   * 🔓 Descriptografar dados da sessão
   * @param {Object} encryptedData - Dados criptografados
   * @returns {Object} Dados descriptografados
   * @throws {Error} Se descriptografia falhar
   */
  decryptData(encryptedData) {
    try {
      if (!encryptedData.encrypted) {
        return encryptedData;
      }
      
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.log('❌ Erro ao descriptografar dados:', error.message);
      throw new Error('Falha na descriptografia - sessão corrompida');
    }
  }

  /**
   * 💾 Salvar sessão criptografada
   * @async
   * @param {Object} sessionData - Dados da sessão
   * @returns {Promise<boolean>} True se salvamento foi bem-sucedido
   */
  async saveSession(sessionData) {
    try {
      const encryptedData = this.encryptData(sessionData);
      await fs.writeJson(this.sessionFile, encryptedData, { spaces: 2 });
      console.log('🔒 Sessão salva com criptografia');
      return true;
    } catch (error) {
      console.log('❌ Erro ao salvar sessão:', error.message);
      return false;
    }
  }

  /**
   * 📂 Carregar sessão descriptografada
   * @async
   * @returns {Promise<Object>} Dados da sessão
   * @throws {Error} Se arquivo não existir ou descriptografia falhar
   */
  async loadSession() {
    try {
      if (!await fs.pathExists(this.sessionFile)) {
        throw new Error('Arquivo de sessão não encontrado');
      }
      
      const encryptedData = await fs.readJson(this.sessionFile);
      const sessionData = this.decryptData(encryptedData);
      
      console.log('🔓 Sessão carregada e descriptografada');
      return sessionData;
    } catch (error) {
      console.log('❌ Erro ao carregar sessão:', error.message);
      throw error;
    }
  }

  /**
   * 🔍 Verificar se sessão existe
   * @async
   * @returns {Promise<boolean>} True se sessão existe e é válida
   */
  async sessionExists() {
    try {
      if (!await fs.pathExists(this.sessionFile)) {
        return false;
      }
      
      await this.loadSession();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * ✅ Validar sessão com Instagram
   * @async
   * @returns {Promise<boolean>} True se sessão é válida e ativa
   */
  async validateSession() {
    try {
      const sessionData = await this.loadSession();
      
      const loginTime = new Date(sessionData.login_timestamp);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        console.log('⚠️  Sessão expirada (mais de 24 horas)');
        return false;
      }
      
      console.log('🔍 Validando sessão com Instagram...');
      const testResponse = await axios.get(
        'https://www.instagram.com/api/v1/users/web_profile_info/?username=instagram',
        {
          headers: {
            'User-Agent': sessionData['User-Agent'],
            'Cookie': sessionData.Cookie,
            'X-IG-App-ID': '936619743392459'
          },
          timeout: 10000
        }
      );
      
      if (testResponse.status === 200) {
        console.log('✅ Sessão válida e ativa');
        return true;
      } else {
        console.log('❌ Sessão inválida');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Sessão inválida:', error.message);
      return false;
    }
  }

  /**
   * 🗑️ Limpar sessão e chaves
   * @async
   * @returns {Promise<boolean>} True se limpeza foi bem-sucedida
   */
  async clearSession() {
    try {
      if (await fs.pathExists(this.sessionFile)) {
        await fs.remove(this.sessionFile);
        console.log('🗑️  Sessão removida');
      }
      
      if (await fs.pathExists(this.keyFile)) {
        await fs.remove(this.keyFile);
        console.log('🗑️  Chave de criptografia removida');
      }
      
      return true;
    } catch (error) {
      console.log('❌ Erro ao limpar sessão:', error.message);
      return false;
    }
  }

  /**
   * 🔐 Processo de login interativo no Instagram
   * @async
   * @throws {Error} Se login falhar
   */
  async login() {
    let browser;
    
    try {
      browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      console.log('🔐 Navegando para página de login...');
      await page.goto('https://www.instagram.com/accounts/login/', { 
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      console.log('\n📝 INSTRUÇÕES DE LOGIN:');
      console.log('1. Faça login manualmente no Instagram');
      console.log('2. Aguarde o redirecionamento para o feed');
      console.log('3. O navegador fechará automaticamente\n');

      console.log('⏳ Aguardando autenticação...');

      await Promise.race([
        page.waitForSelector('[data-testid="user-avatar"]', { timeout: 300000 }),
        page.waitForSelector('nav', { timeout: 300000 }),
        page.waitForFunction(
          () => window.location.href.includes('instagram.com') && 
                !window.location.href.includes('login'),
          { timeout: 300000 }
        )
      ]);

      console.log('✅ Login detectado com sucesso!');
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log('📦 Coletando dados da sessão...');
      
      const cookies = await page.cookies();
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const userAgent = await page.evaluate(() => navigator.userAgent);

      const sessionData = {
        'User-Agent': userAgent,
        'Cookie': cookieString,
        'cookies': cookies,
        'login_timestamp': new Date().toISOString()
      };

      const saved = await this.saveSession(sessionData);
      
      if (saved) {
        console.log('\n✅ Login realizado com sucesso!');
        console.log('⏰ Sessão criada em:', new Date().toLocaleString('pt-BR'));
        console.log('💡 Agora você pode usar: raveninsta buscar <usuario>');
      }

    } catch (error) {
      console.log('❌ Erro durante o login:', error.message);
      throw error;
      
    } finally {
      if (browser) {
        await browser.close();
        console.log('🔒 Navegador fechado');
      }
    }
  }
}

/** 🏭 Instância única do SessionManager (singleton pattern) */
let _sessionManagerInstance = null;

/**
 * 🎯 Obter instância do SessionManager
 * @returns {SessionManager} Instância única do gerenciador de sessão
 */
function getSessionManager() {
  if (!_sessionManagerInstance) {
    _sessionManagerInstance = new SessionManager();
  }
  return _sessionManagerInstance;
}

/**
 * 🔐 Função de login para exportação
 * @async
 * @returns {Promise<void>}
 */
async function login() {
  const sessionManager = getSessionManager();
  return await sessionManager.login();
}

module.exports = { 
  login,
  getSessionManager
};