const axios = require('axios');
const { sessionManager } = require('./session');

class InstagramAPI {
  constructor() {
    this.baseURL = 'https://www.instagram.com/api/v1';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'X-IG-App-ID': '936619743392459',
      'Accept': 'application/json'
    };
    this.sessionData = null;
  }

  async loadSession() {
    try {
      const isValid = await sessionManager.validateSession();
      if (!isValid) {
        throw new Error('Sessão inválida. Execute "raveninsta login" para renovar.');
      }
      
      this.sessionData = await sessionManager.loadSession();
      this.headers['Cookie'] = this.sessionData.Cookie;
      this.headers['User-Agent'] = this.sessionData['User-Agent'];
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao carregar sessão:', error.message);
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      console.log(`🔍 Buscando: ${username}`);
      
      const response = await axios.get(
        `${this.baseURL}/users/web_profile_info/?username=${username}`,
        {
          headers: this.headers,
          timeout: 30000
        }
      );

      if (response.data.data?.user) {
        const user = response.data.data.user;
        return this.formatUserData(user);
      } else {
        throw new Error('Perfil não encontrado');
      }
    } catch (error) {
      console.error('❌ Erro na API:', this.getErrorMessage(error));
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      console.log(`🔍 Buscando ID: ${userId}`);
      
      const response = await axios.get(
        `${this.baseURL}/users/${userId}/info/`,
        {
          headers: this.headers,
          timeout: 30000
        }
      );

      if (response.data.user) {
        const user = response.data.user;
        return this.formatUserData(user, true);
      } else {
        throw new Error('Perfil não encontrado');
      }
    } catch (error) {
      console.error('❌ Erro na API:', this.getErrorMessage(error));
      throw error;
    }
  }

  formatUserData(user, fromId = false) {
    if (fromId) {
      return {
        id: user.pk,
        username: user.username,
        full_name: user.full_name || '',
        biography: user.biography || '',
        followers: user.follower_count || 0,
        following: user.following_count || 0,
        is_private: user.is_private || false,
        is_verified: user.is_verified || false,
        profile_pic_url: user.profile_pic_url || '',
        posts_count: user.media_count || 0,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        id: user.id,
        username: user.username,
        full_name: user.full_name || '',
        biography: user.biography || '',
        followers: user.edge_followed_by?.count || 0,
        following: user.edge_follow?.count || 0,
        is_private: user.is_private || false,
        is_verified: user.is_verified || false,
        profile_pic_url: user.profile_pic_url || '',
        posts_count: user.edge_owner_to_timeline_media?.count || 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  getErrorMessage(error) {
    if (error.response) {
      switch (error.response.status) {
        case 404: return 'Perfil não encontrado';
        case 401: return 'Sessão expirada - faça login novamente';
        case 403: return 'Acesso negado - perfil privado';
        case 429: return 'Muitas requisições - aguarde';
        default: return `Erro ${error.response.status}`;
      }
    } else if (error.request) {
      return 'Sem resposta do servidor';
    } else {
      return error.message;
    }
  }
}

module.exports = new InstagramAPI();