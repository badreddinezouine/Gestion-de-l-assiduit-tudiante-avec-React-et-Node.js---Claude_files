import api from './api';

export const chatbotService = {
  analyzeStudent: async (etudiantId, coursId) => {
    try {
      const response = await api.post('/chatbot/analyze', {
        etudiantId,
        coursId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  reviewDecision: async (decisionId, action) => {
    try {
      const response = await api.put(`/chatbot/review/${decisionId}`, {
        action
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getDecisionHistory: async (etudiantId, coursId) => {
    try {
      const params = {};
      if (etudiantId) params.etudiantId = etudiantId;
      if (coursId) params.coursId = coursId;
      
      const response = await api.get('/chatbot/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCourseRecommendations: async (coursId) => {
    try {
      const response = await api.get(`/chatbot/recommendations/${coursId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};