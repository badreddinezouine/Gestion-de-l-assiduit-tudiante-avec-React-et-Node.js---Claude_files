import axios from 'axios';

// Utiliser le proxy React ou l'URL directe
const API_URL = process.env.NODE_ENV === 'development' 
  ? ''  // Vide pour utiliser le proxy
  : process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('🔗 API URL configurée :', API_URL || 'Proxy React activé');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Requête API :', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête API :', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log('📥 Réponse API :', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erreur réponse API :', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;